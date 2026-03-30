"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeParticipantRoleUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class ChangeParticipantRoleUseCase {
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
            throw new participant_errors_1.UserIsNotParticipantError("User is not a member of the conversation");
        }
        return target;
    }
    async invalidateParticipantCache(conversationId, targetId) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
        await this.cacheService.del(`participant:conv:${conversationId}:user:${targetId}`);
    }
    async changeParticipantRoleUseCase(actorId, conversationId, targetId) {
        const actor = await this.actorIsParticipant(conversationId, actorId);
        const target = await this.targetIsParticipant(conversationId, targetId);
        target.changeRole(actor, target);
        await this.participantRepo.save(target);
        await this.invalidateParticipantCache(conversationId, targetId);
        return this.participantMapper.mapToParticipantDto(target);
    }
}
exports.ChangeParticipantRoleUseCase = ChangeParticipantRoleUseCase;
