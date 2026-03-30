"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanGroupParticipantUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class BanGroupParticipantUseCase {
    participantRepo;
    conversationBanRepoInterface;
    cacheService;
    constructor(participantRepo, conversationBanRepoInterface, cacheService) {
        this.participantRepo = participantRepo;
        this.conversationBanRepoInterface = conversationBanRepoInterface;
        this.cacheService = cacheService;
    }
    async targetIsParticipant(conversationId, targetId) {
        const target = await this.participantRepo.findParticipant(conversationId, targetId);
        if (!target) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return target;
    }
    async actorIsParticipant(conversationId, actorId) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }
    ensureCanBan(actor, target) {
        if (!actor.canBanOther(target)) {
            throw new participant_errors_1.InsufficientPermissionsError("Actor is not allowed to ban this user");
        }
    }
    createBan(data) {
        return {
            conversationId: data.conversationId,
            userId: data.userId,
            bannedBy: data.bannedBy,
            createdAt: new Date(),
            reason: data.reason,
        };
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
    async banGroupParticipantUseCase(data) {
        const actor = await this.actorIsParticipant(data.conversationId, data.bannedBy);
        const target = await this.targetIsParticipant(data.conversationId, data.userId);
        this.ensureCanBan(actor, target);
        const createdBan = this.createBan(data);
        await this.conversationBanRepoInterface.ban(createdBan);
        await this.participantRepo.remove(data.conversationId, data.userId);
        await Promise.all([
            await this.invalidateParticipantsCache(data.conversationId),
            await this.invalidateUserConversations(data.userId),
            await this.invalidateConversationBansCache(data.conversationId),
        ]);
        return { ...createdBan, createdAt: createdBan.createdAt.toISOString() };
    }
}
exports.BanGroupParticipantUseCase = BanGroupParticipantUseCase;
