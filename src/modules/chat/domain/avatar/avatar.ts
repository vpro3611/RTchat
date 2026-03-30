export class Avatar {
    constructor(
        private readonly id: string | null,
        private readonly data: Buffer,
        private readonly mimeType: string,
        private readonly createdAt?: Date
    ) {}

    static create(data: Buffer, mimeType: string): Avatar {
        return new Avatar(null, data, mimeType);
    }

    static restore(id: string, data: Buffer, mimeType: string, createdAt: Date): Avatar {
        return new Avatar(id, data, mimeType, createdAt);
    }

    getId = () => this.id;
    getData = () => this.data;
    getMimeType = () => this.mimeType;
    getCreatedAt = () => this.createdAt;
}
