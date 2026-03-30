"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestStatusUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
const participant_1 = require("../../domain/participant/participant");
const conversation_requests_errors_1 = require("../../errors/conversation_requests_errors/conversation_requests_errors");
class ChangeRequestStatusUseCase {
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
    async ensureIsParticipant(conversationId, actorId) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return participant;
    }
    ensureIsOwner(participant) {
        if (participant.getRole() !== "owner") {
            throw new participant_errors_1.InsufficientPermissionsError("User is not an owner of the conversation");
        }
    }
    async getSpecificRequest(conversationId, requestId) {
        const request = await this.conversationRequestsRepo.getSpecificRequest(requestId, conversationId);
        if (!request) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("Request not found");
        }
        return request;
    }
    ensureIsSameConv(request, conversationId) {
        if (request.getConversationId() !== conversationId) {
            throw new conversation_requests_errors_1.CannotPerformActionOverReqError("Request not found in this conversation");
        }
    }
    ensureIsPending(request) {
        if (request.getStatus() !== "pending") {
            throw new conversation_requests_errors_1.CannotPerformActionOverReqError("Request is not pending");
        }
    }
    ensureIsNotDeleted(request) {
        if (request.getIsDeleted()) {
            throw new conversation_requests_errors_1.CannotPerformActionOverReqError("Request has been deleted");
        }
    }
    async invalidateCaches(conversationId, userId, requestId) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
            this.cacheService.del(`conv_request:specific:${requestId}`),
        ]);
    }
    async invalidateParticipantCaches(conversationId, userId) {
        await Promise.all([
            this.cacheService.del(`participants:conv:${conversationId}`),
            this.cacheService.delByPattern(`conv:user:${userId}:*`),
        ]);
    }
    async changeRequestStatusUseCase(actorId, conversationId, requestId, reviewMessage, status) {
        const participant = await this.ensureIsParticipant(conversationId, actorId);
        this.ensureIsOwner(participant);
        const request = await this.getSpecificRequest(conversationId, requestId);
        this.ensureIsPending(request);
        this.ensureIsNotDeleted(request);
        this.ensureIsSameConv(request, conversationId);
        const updated = await this.conversationRequestsRepo.updateRequest(requestId, conversationId, status, reviewMessage);
        if (status === conversation_requests_1.ConversationRequestsStatus.ACCEPTED) {
            const newParticipant = participant_1.Participant.createAsMember(conversationId, request.getUserId());
            await this.participantRepo.save(newParticipant);
            await this.invalidateParticipantCaches(conversationId, request.getUserId());
        }
        await this.invalidateCaches(conversationId, request.getUserId(), requestId);
        return this.requestMapper.mapToRequestDto(updated);
    }
}
exports.ChangeRequestStatusUseCase = ChangeRequestStatusUseCase;
