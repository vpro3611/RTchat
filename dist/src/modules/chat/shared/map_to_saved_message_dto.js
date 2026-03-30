"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapToSavedMessageDto = void 0;
class MapToSavedMessageDto {
    mapToSavedMessageDto(savedMessage) {
        return {
            savedBy: savedMessage.getSavedBy(),
            messageId: savedMessage.getMessageId(),
            conversationId: savedMessage.getConversationId(),
            senderId: savedMessage.getSenderId(),
            content: savedMessage.getContent(),
            createdAt: savedMessage.getCreatedAt().toISOString(),
            updatedAt: savedMessage.getUpdatedAt()?.toISOString() ?? null,
        };
    }
}
exports.MapToSavedMessageDto = MapToSavedMessageDto;
