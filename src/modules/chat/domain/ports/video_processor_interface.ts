export interface VideoProcessorInterface {
    stripMetadata(buffer: Buffer): Promise<Buffer>;
}
