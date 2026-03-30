"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawRequestUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
const conversation_requests_errors_1 = require("../../errors/conversation_requests_errors/conversation_requests_errors");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
class WithdrawRequestUseCase {
    userRepoReader;
    conversationRequestsRepo;
    mapToRequestDto;
    cacheService;
    constructor(userRepoReader, conversationRequestsRepo, mapToRequestDto, cacheService) {
        this.userRepoReader = userRepoReader;
        this.conversationRequestsRepo = conversationRequestsRepo;
        this.mapToRequestDto = mapToRequestDto;
        this.cacheService = cacheService;
    }
    async ensureUserExists(userId) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError("User not found");
        }
        return user;
    }
    async ensureRequestExists(requestId) {
        const request = await this.conversationRequestsRepo.getRequestById(requestId);
        if (!request) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("Request not found");
        }
        return request;
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
    async withdrawRequestUseCase(actorId, requestId) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        const request = await this.ensureRequestExists(requestId);
        this.ensureIsNotDeleted(request);
        this.ensureIsPending(request);
        const changedReq = await this.conversationRequestsRepo.updateRequest(requestId, request.getConversationId(), conversation_requests_1.ConversationRequestsStatus.WITHDRAWN, `Request has been withdrawn by user (initiator): ${user.getUsername().getValue()}`);
        await this.invalidateCaches(request.getConversationId(), actorId, requestId);
        return this.mapToRequestDto.mapToRequestDto(changedReq);
    }
}
exports.WithdrawRequestUseCase = WithdrawRequestUseCase;
