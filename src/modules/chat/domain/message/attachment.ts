export type AttachmentType = 'image' | 'video' | 'file';

export class Attachment {
    constructor(
        public readonly id: string,
        public readonly blobId: string,
        public readonly type: AttachmentType,
        public readonly name: string,
        public readonly mimeType: string,
        public readonly size: number,
        public readonly createdAt: Date = new Date()
    ) {}

    static restore(id: string, blobId: string, type: AttachmentType, name: string, mimeType: string, size: number, createdAt: Date) {
        return new Attachment(id, blobId, type, name, mimeType, size, createdAt);
    }

    static create(blobId: string, type: AttachmentType, name: string, mimeType: string, size: number) {
        return new Attachment(crypto.randomUUID(), blobId, type, name, mimeType, size);
    }
}
