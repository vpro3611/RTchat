"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnmuteParticipantUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const participant_role_1 = require("../../domain/participant/participant_role");
class UnmuteParticipantUseCase {
    participantRepo;
    participantMapper;
    cacheService;
    constructor(participantRepo, participantMapper, cacheService) {
        this.participantRepo = participantRepo;
        this.participantMapper = participantMapper;
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
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return target;
    }
    enforceRules(actor, target) {
        if (actor.getRole() !== participant_role_1.ParticipantRole.OWNER) {
            throw new participant_errors_1.InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }
    async invalidateParticipantsCache(conversationId, targetId) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
        await this.cacheService.del(`participant:conv:${conversationId}:user:${targetId}`);
    }
    async unmuteParticipantUseCase(actorId, targetId, conversationId) {
        const actor = await this.actorIsParticipant(conversationId, actorId);
        const target = await this.targetIsParticipant(conversationId, targetId);
        this.enforceRules(actor, target);
        target.unmute();
        await this.participantRepo.save(target);
        await this.invalidateParticipantsCache(conversationId, targetId);
        return this.participantMapper.mapToParticipantDto(target);
    }
}
exports.UnmuteParticipantUseCase = UnmuteParticipantUseCase;
