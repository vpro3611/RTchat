export interface AudioProcessorInterface {
    processAudio(buffer: Buffer): Promise<{ data: Buffer; duration: number; mimeType: string }>;
}
