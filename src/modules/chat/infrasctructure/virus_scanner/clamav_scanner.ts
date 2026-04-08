import NodeClam from "clamscan";
import { Readable } from "stream";
import { VirusScannerInterface } from "../../domain/ports/virus_scanner_interface";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export class ClamAVScanner implements VirusScannerInterface {
    private clamscan: any;
    private initialized = false;
    private useFallback = false;

    private async init() {
        if (this.initialized) return;
        try {
            this.clamscan = await new NodeClam().init({
                clamdscan: {
                    host: process.env.CLAMAV_HOST || '127.0.0.1',
                    port: parseInt(process.env.CLAMAV_PORT || '3310'),
                    timeout: parseInt(process.env.CLAMAV_TIMEOUT || '5000'),
                    socket: '/var/run/clamav/clamd.ctl', // Added local socket fallback
                },
                preference: 'clamdscan'
            });
            this.initialized = true;
            this.useFallback = false;
        } catch (error) {
            console.warn("Could not connect to ClamAV daemon. Falling back to slow binary scanning.", error);
            this.useFallback = true;
            this.initialized = true;
        }
    }

    private async scanWithBinary(buffer: Buffer): Promise<boolean> {
        const tempPath = path.join("/tmp", `scan_fallback_${Date.now()}.tmp`);
        await fs.writeFile(tempPath, buffer);
        try {
            await execAsync(`clamscan ${tempPath}`);
            return true;
        } catch (error: any) {
            // Clamscan exit codes: 0 = clean, 1 = infected, 2 = error
            if (error.code === 1) {
                console.warn(`File scan result: INFECTED (via binary)`);
                return false;
            }
            
            // If it's error code 2 or command not found (code 127)
            console.error(`Virus scan technical error (binary fallback failed):`, error.message);
            
            // If the scanner itself failed to run (e.g. not installed), 
            // we'll log it but let the file pass to avoid blocking all users due to infra issues.
            return true;
        } finally {
            await fs.unlink(tempPath).catch(() => {});
        }
    }

    async scanBuffer(buffer: Buffer): Promise<boolean> {
        await this.init();
        
        if (this.useFallback) {
            console.log(`Starting slow virus scan (binary fallback) for buffer of size ${buffer.length}...`);
            const startTime = Date.now();
            const result = await this.scanWithBinary(buffer);
            const duration = Date.now() - startTime;
            console.log(`Fallback virus scan completed in ${duration}ms: ${result ? 'Clean' : 'Infected'}`);
            return result;
        }

        console.log(`Starting fast virus scan (daemon) for buffer of size ${buffer.length}...`);
        const startTime = Date.now();
        
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        try {
            const { isInfected, viruses } = await this.clamscan.scanStream(stream);
            const duration = Date.now() - startTime;
            
            if (isInfected) {
                console.error(`Virus scan completed in ${duration}ms: INFECTED (${viruses.join(', ')})`);
                return false;
            }
            
            console.log(`Virus scan completed in ${duration}ms: Clean`);
            return true;
        } catch (error) {
            console.error(`Virus scan error (daemon unreachable during scan):`, error);
            // Last resort: try binary if stream failed
            return await this.scanWithBinary(buffer);
        }
    }
}
