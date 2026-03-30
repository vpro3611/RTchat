"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveConversationUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class LeaveConversationUseCase {
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
    async invalidateParticipantsCache(conversationId) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
    }
    async invalidateUserConversations(userId) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }
    async leaveConversationUseCase(actorId, conversationId) {
        await this.actorIsParticipant(conversationId, actorId);
        await this.participantRepo.remove(conversationId, actorId);
        await Promise.all([
            await this.invalidateParticipantsCache(conversationId),
            await this.invalidateUserConversations(actorId)
        ]);
    }
}
exports.LeaveConversationUseCase = LeaveConversationUseCase;
