"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificRequestGroupUseCase = void 0;
const conversation_requests_errors_1 = require("../../errors/conversation_requests_errors/conversation_requests_errors");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class GetSpecificRequestGroupUseCase {
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
    async ensureIsParticipant(actorId, conversationId) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("User is not a member of the conversation");
        }
        return participant;
    }
    ensureIsOwner(actor) {
        if (actor.getRole() !== "owner") {
            throw new participant_errors_1.InsufficientPermissionsError("User is not an owner of the conversation");
        }
    }
    async ensureRequestExists(requestId) {
        const request = await this.conversationRequestsRepo.getRequestById(requestId);
        if (!request) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("Request not found");
        }
        return request;
    }
    ensureReqNotDeleted(request) {
        if (request.getIsDeleted()) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("Request has been deleted");
        }
    }
    ensureIsSameConv(request, conversationId) {
        if (request.getConversationId() !== conversationId) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("Request not found in this conversation");
        }
    }
    async getSpecificRequestGroupUseCase(actorId, conversationId, requestId) {
        const actor = await this.ensureIsParticipant(actorId, conversationId);
        this.ensureIsOwner(actor);
        const cacheKey = `conv_request:specific:${requestId}`;
        return await this.cacheService.remember(cacheKey, 60, async () => {
            const request = await this.ensureRequestExists(requestId);
            this.ensureReqNotDeleted(request);
            this.ensureIsSameConv(request, conversationId);
            return this.requestMapper.mapToRequestDto(request);
        });
    }
}
exports.GetSpecificRequestGroupUseCase = GetSpecificRequestGroupUseCase;
