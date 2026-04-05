

import {AttachmentDTO} from "./attachment_dto";

export type ReplyMetadataDTO = {
    parentMessageId: string,
    parentContentSnippet: string,
    parentSenderId: string
}

export type MessageDTO = {
    id: string,
    conversationId: string,
    senderId: string,
    senderUsername?: string,
    senderAvatarId?: string | null,
    content: string,
    isEdited: boolean,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
    originalSenderId?: string,
    isResent: boolean,
    isRead: boolean,
    attachments: AttachmentDTO[],
    replyMetadata?: ReplyMetadataDTO
}