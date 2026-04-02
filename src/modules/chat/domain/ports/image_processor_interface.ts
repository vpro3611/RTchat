export interface ImageProcessorInterface {
    processAvatar(buffer: Buffer): Promise<{ data: Buffer; mimeType: string }>;
    processImage(buffer: Buffer): Promise<{ data: Buffer; mimeType: string }>;
}
