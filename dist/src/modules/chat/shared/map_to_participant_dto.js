"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapToParticipantDto = void 0;
class MapToParticipantDto {
    mapToParticipantDto(participant) {
        const mutedUntil = participant.getMutedUntil();
        const joinedAt = participant.getJoinedAt();
        return {
            conversationId: participant.getConversationId(),
            userId: participant.userId,
            role: participant.getRole(),
            canSendMessages: participant.getCanSendMessages(),
            mutedUntil: mutedUntil instanceof Date ? mutedUntil.toISOString() : mutedUntil,
            joinedAt: joinedAt instanceof Date ? joinedAt.toISOString() : joinedAt,
        };
    }
}
exports.MapToParticipantDto = MapToParticipantDto;
