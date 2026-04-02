import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { VirusScannerInterface } from "../../domain/ports/virus_scanner_interface";

const execAsync = promisify(exec);

export class ClamAVScanner implements VirusScannerInterface {
    async scanBuffer(buffer: Buffer): Promise<boolean> {
        const tempPath = path.join("/tmp", `scan_${Date.now()}.tmp`);
        await fs.writeFile(tempPath, buffer);
        try {
            await execAsync(`clamscan ${tempPath}`);
            return true;
        } catch (error) {
            return false;
        } finally {
            await fs.unlink(tempPath).catch(() => {});
        }
    }
}
