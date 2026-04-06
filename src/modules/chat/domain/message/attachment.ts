export type AttachmentType = 'image' | 'video' | 'file' | 'voice';

export class Attachment {
    constructor(
        public readonly id: string,
        public readonly blobId: string,
        public readonly type: AttachmentType,
        public readonly name: string,
        public readonly mimeType: string,
        public readonly size: number,
        public readonly createdAt: Date = new Date(),
        public readonly duration?: number
    ) {}

    static restore(id: string, blobId: string, type: AttachmentType, name: string, mimeType: string, size: number, createdAt: Date, duration?: number) {
        return new Attachment(id, blobId, type, name, mimeType, size, createdAt, duration);
    }

    static create(blobId: string, type: AttachmentType, name: string, mimeType: string, size: number, duration?: number) {
        return new Attachment(crypto.randomUUID(), blobId, type, name, mimeType, size, undefined, duration);
    }
}
