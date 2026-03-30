"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnbanGroupParticipantUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const conversation_bans_errors_1 = require("../../errors/conversation_bans_error/conversation_bans_errors");
class UnbanGroupParticipantUseCase {
    participantRepo;
    conversationBanRepoInterface;
    cacheService;
    constructor(participantRepo, conversationBanRepoInterface, cacheService) {
        this.participantRepo = participantRepo;
        this.conversationBanRepoInterface = conversationBanRepoInterface;
        this.cacheService = cacheService;
    }
    async invalidateParticipantsCache(conversationId) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
    }
    async invalidateUserConversations(userId) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }
    async invalidateConversationBansCache(conversationId) {
        await this.cacheService.del(`bans:conv:${conversationId}`);
    }
    async actorIsParticipant(conversationId, actorId) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }
    async ensureTargeIsBanned(conversationId, userId) {
        const banned = await this.conversationBanRepoInterface.isBanned(conversationId, userId);
        if (!banned) {
            throw new conversation_bans_errors_1.NotBannedError("User is not banned from the conversation");
        }
    }
    async unbanGroupParticipantUseCase(conversationId, actorId, targetId) {
        const actor = await this.actorIsParticipant(conversationId, actorId);
        await this.ensureTargeIsBanned(conversationId, targetId);
        actor.canUnban(targetId);
        await this.conversationBanRepoInterface.unban(conversationId, targetId);
        await Promise.all([
            await this.invalidateParticipantsCache(conversationId),
            await this.invalidateUserConversations(targetId),
            await this.invalidateConversationBansCache(conversationId),
        ]);
    }
}
exports.UnbanGroupParticipantUseCase = UnbanGroupParticipantUseCase;
