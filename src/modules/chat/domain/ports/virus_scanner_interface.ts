export interface VirusScannerInterface {
    scanBuffer(buffer: Buffer): Promise<boolean>;
}
