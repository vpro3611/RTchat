"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetParticipantsUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class GetParticipantsUseCase {
    participantRepo;
    cacheService;
    constructor(participantRepo, cacheService) {
        this.participantRepo = participantRepo;
        this.cacheService = cacheService;
    }
    async actorIsParticipant(conversationId, actorId) {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }
    async getParticipantsUseCase(actorId, conversationId, limit, cursor) {
        await this.actorIsParticipant(conversationId, actorId);
        const cacheKey = `participants:conv:${conversationId}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;
        return this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.participantRepo.getParticipants(conversationId, limit, cursor);
            return {
                items: result.items.map(participant => ({
                    conversationId: participant.conversationId,
                    userId: participant.userId,
                    username: participant.username,
                    email: participant.email,
                    role: participant.role,
                    canSendMessages: participant.canSendMessages,
                    mutedUntil: participant.mutedUntil instanceof Date
                        ? participant.mutedUntil.toISOString()
                        : participant.mutedUntil,
                    joinedAt: participant.joinedAt instanceof Date
                        ? participant.joinedAt.toISOString()
                        : participant.joinedAt,
                })),
                nextCursor: result.nextCursor,
            };
        });
    }
}
exports.GetParticipantsUseCase = GetParticipantsUseCase;
