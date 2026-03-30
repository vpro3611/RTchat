"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRequestUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
const conversation_requests_errors_1 = require("../../errors/conversation_requests_errors/conversation_requests_errors");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
class RemoveRequestUseCase {
    Reader;
    conversationRequestsRepo;
    cacheService;
    constructor(Reader, conversationRequestsRepo, cacheService) {
        this.Reader = Reader;
        this.conversationRequestsRepo = conversationRequestsRepo;
        this.cacheService = cacheService;
    }
    async ensureUserExists(userId) {
        const user = await this.Reader.getUserById(userId);
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
    async invalidateCaches(conversationId, userId, requestId) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
            this.cacheService.del(`conv_request:specific:${requestId}`),
        ]);
    }
    async removeRequestUseCase(actorId, requestId) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        const request = await this.ensureRequestExists(requestId);
        if (request.getIsDeleted()) {
            throw new conversation_requests_errors_1.CannotPerformActionOverReqError("Request has already been deleted");
        }
        if (request.getStatus() === "pending") {
            const _ = await this.conversationRequestsRepo.updateRequest(requestId, request.getConversationId(), conversation_requests_1.ConversationRequestsStatus.WITHDRAWN, `Request has been withdrawn by user (initiator): ${user.getUsername().getValue()}`);
        }
        await this.conversationRequestsRepo.removeRequest(requestId);
        await this.invalidateCaches(request.getConversationId(), request.getUserId(), requestId);
    }
}
exports.RemoveRequestUseCase = RemoveRequestUseCase;
