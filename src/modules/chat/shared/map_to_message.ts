import {Message} from "../domain/message/message";
import {MessageDTO} from "../DTO/message_dto";


export class MapToMessage {
    mapToMessage(message: Message, maxReadAt: Date | null = null): MessageDTO {
        const isRead = maxReadAt ? message.getCreatedAt() <= maxReadAt : false;
        const replyMetadata = message.getReplyMetadata();

        return {
            id: message.id,
            conversationId: message.getConversationId(),
            senderId: message.getSenderId(),
            content: message.getContent().getContentValue(),
            isEdited: message.getIsEdited(),
            isDeleted: message.getIsDeleted(),
            createdAt: message.getCreatedAt().toISOString(),
            updatedAt: message.getUpdatedAt().toISOString(),
            originalSenderId: message.getOriginalSenderId(),
            isResent: message.getIsResent(),
            isRead: isRead,
            attachments: message.getAttachments().map(a => ({
                id: a.id,
                blobId: a.blobId,
                type: a.type,
                name: a.name,
                mimeType: a.mimeType,
                size: a.size,
                createdAt: a.createdAt.toISOString()
            })),
            replyMetadata: replyMetadata ? {
                parentMessageId: replyMetadata.parentMessageId,
                parentContentSnippet: replyMetadata.parentContentSnippet,
                parentSenderId: replyMetadata.parentSenderId
            } : undefined
        }
    }
}