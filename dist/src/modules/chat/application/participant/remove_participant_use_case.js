"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveParticipantUseCase = void 0;
const participant_role_1 = require("../../domain/participant/participant_role");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class RemoveParticipantUseCase {
    participantRepo;
    cacheService;
    constructor(participantRepo, cacheService) {
        this.participantRepo = participantRepo;
        this.cacheService = cacheService;
    }
    async actorIsParticipant(conversationId, actorId) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }
    async targetIsParticipant(conversationId, targetId) {
        const target = await this.participantRepo.findParticipant(conversationId, targetId);
        if (!target) {
            throw new participant_errors_1.UserIsNotParticipantError("User is not a member of the conversation");
        }
        return target;
    }
    checkActorRole(actor) {
        if (actor.getRole() !== participant_role_1.ParticipantRole.OWNER) {
            throw new participant_errors_1.InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }
    checkTargetRole(target) {
        if (target.getRole() === participant_role_1.ParticipantRole.OWNER) {
            throw new participant_errors_1.InsufficientPermissionsError("Only a member can be removed from the conversation");
        }
    }
    async invalidateParticipantsCache(conversationId, targetId) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
        await this.cacheService.del(`participant:conv:${conversationId}:user:${targetId}`);
    }
    async invalidateUserConversations(userId) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }
    async removeParticipantUseCase(actorId, conversationId, targetId) {
        const actor = await this.actorIsParticipant(conversationId, actorId);
        this.checkActorRole(actor);
        const target = await this.targetIsParticipant(conversationId, targetId);
        this.checkTargetRole(target);
        await this.participantRepo.remove(conversationId, targetId);
        await this.invalidateParticipantsCache(conversationId, targetId);
        await this.invalidateUserConversations(targetId);
    }
}
exports.RemoveParticipantUseCase = RemoveParticipantUseCase;
