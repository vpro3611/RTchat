import {AttachmentType} from "../domain/message/attachment";

export type AttachmentDTO = {
    id: string;
    blobId: string;
    type: AttachmentType;
    name: string;
    mimeType: string;
    size: number;
    createdAt: string;
    duration?: number;
}
