"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapToConversationDto = void 0;
class MapToConversationDto {
    mapToConversationDto(conversation) {
        return {
            id: conversation.id,
            conversationType: conversation.getConversationType(),
            title: conversation.getTitle().getValue(),
            avatarId: conversation.getAvatarId(),
            createdBy: conversation.getCreatedBy(),
            createdAt: conversation.getCreatedAt().toISOString(),
            lastMessageAt: conversation.getLastMessageAt()?.toISOString() ?? null,
            userLow: conversation.getUserLow(),
            userHigh: conversation.getUserHigh(),
        };
    }
}
exports.MapToConversationDto = MapToConversationDto;
