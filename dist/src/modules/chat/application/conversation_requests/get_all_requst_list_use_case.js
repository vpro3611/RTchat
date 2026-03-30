"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllRequestListUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const participant_role_1 = require("../../domain/participant/participant_role");
class GetAllRequestListUseCase {
    participantRepo;
    conversationRequestsRepo;
    requestMapper;
    cacheService;
    constructor(participantRepo, conversationRequestsRepo, requestMapper, cacheService) {
        this.participantRepo = participantRepo;
        this.conversationRequestsRepo = conversationRequestsRepo;
        this.requestMapper = requestMapper;
        this.cacheService = cacheService;
    }
    async actorIsParticipant(conversationId, actorId) {
        const exists = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!exists) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return exists;
    }
    ensureIsOwner(participant) {
        if (participant.getRole() !== participant_role_1.ParticipantRole.OWNER) {
            throw new participant_errors_1.InsufficientPermissionsError("User is not an owner of the conversation");
        }
    }
    async getAllRequestsListUseCase(actorId, conversationId, status) {
        const actor = await this.actorIsParticipant(conversationId, actorId);
        this.ensureIsOwner(actor);
        const cacheKey = `conv_requests:group:${conversationId}:${status ?? 'all'}`;
        return await this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.conversationRequestsRepo.getRequests(conversationId, status);
            return result.map((r) => this.requestMapper.mapToRequestDto(r));
        });
    }
}
exports.GetAllRequestListUseCase = GetAllRequestListUseCase;
