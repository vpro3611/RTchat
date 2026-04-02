import NodeClam from "clamscan";
import { Readable } from "stream";
import { VirusScannerInterface } from "../../domain/ports/virus_scanner_interface";

export class ClamAVScanner implements VirusScannerInterface {
    private clamscan: any;
    private initialized = false;

    private async init() {
        if (this.initialized) return;
        this.clamscan = await new NodeClam().init({
            clamdscan: {
                host: process.env.CLAMAV_HOST || '127.0.0.1',
                port: parseInt(process.env.CLAMAV_PORT || '3310'),
                timeout: parseInt(process.env.CLAMAV_TIMEOUT || '5000'),
            },
            preference: 'clamdscan'
        });
        this.initialized = true;
    }

    async scanBuffer(buffer: Buffer): Promise<boolean> {
        await this.init();
        
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
            console.error(`Virus scan error (daemon unreachable?):`, error);
            return false; // Fail secure
        }
    }
}
