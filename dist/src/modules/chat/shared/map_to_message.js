"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapToMessage = void 0;
class MapToMessage {
    mapToMessage(message) {
        return {
            id: message.id,
            conversationId: message.getConversationId(),
            senderId: message.getSenderId(),
            content: message.getContent().getContentValue(),
            isEdited: message.getIsEdited(),
            isDeleted: message.getIsDeleted(),
            createdAt: message.getCreatedAt().toISOString(),
            updatedAt: message.getUpdatedAt().toISOString(),
        };
    }
}
exports.MapToMessage = MapToMessage;
