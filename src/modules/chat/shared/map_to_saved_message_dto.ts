import {SavedMessages} from "../domain/saved_messages/saved_messages";
import {SavedMessageDTO} from "../DTO/saved_message_dto";


export class MapToSavedMessageDto {
    mapToSavedMessageDto(savedMessage: SavedMessages): SavedMessageDTO {
        return {
            savedBy: savedMessage.getSavedBy(),
            messageId: savedMessage.getMessageId(),
            conversationId: savedMessage.getConversationId(),
            senderId: savedMessage.getSenderId(),
            content: savedMessage.getContent(),
            createdAt: savedMessage.getCreatedAt().toISOString(),
            updatedAt: savedMessage.getUpdatedAt()?.toISOString() ?? null,
        }
    }
}