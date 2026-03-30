import {Conversation} from "../domain/conversation/conversation";
import {ConversationDTO} from "../DTO/conversation_dto";


export class MapToConversationDto {
    mapToConversationDto(conversation: Conversation): ConversationDTO {
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
        }
    }
}