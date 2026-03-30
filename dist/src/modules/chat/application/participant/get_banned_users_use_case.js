"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBannedUsersUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const participant_role_1 = require("../../domain/participant/participant_role");
class GetBannedUsersUseCase {
    participantRepo;
    conversationBanRepoInterface;
    cacheService;
    constructor(participantRepo, conversationBanRepoInterface, cacheService) {
        this.participantRepo = participantRepo;
        this.conversationBanRepoInterface = conversationBanRepoInterface;
        this.cacheService = cacheService;
    }
    async getActor(conversationId, actorId) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }
    async ensureIsOwner(actor) {
        if (actor.getRole() !== participant_role_1.ParticipantRole.OWNER) {
            throw new participant_errors_1.InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }
    async getBannedUsersUseCase(conversationId, actorId) {
        const cacheKey = `bans:conv:${conversationId}`;
        const actor = await this.getActor(conversationId, actorId);
        await this.ensureIsOwner(actor);
        return this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.conversationBanRepoInterface.getBannedUsers(conversationId);
            return result.map((c) => {
                return {
                    conversationId: c.conversationId,
                    userId: c.userId,
                    bannedBy: c.bannedBy,
                    createdAt: c.createdAt.toISOString(),
                    reason: c.reason,
                };
            });
        });
    }
}
exports.GetBannedUsersUseCase = GetBannedUsersUseCase;
