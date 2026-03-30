"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificRequestUserUseCase = void 0;
const conversation_requests_errors_1 = require("../../errors/conversation_requests_errors/conversation_requests_errors");
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class GetSpecificRequestUserUseCase {
    conversationRequestsRepo;
    userRepoReader;
    mapToRequestDto;
    cacheService;
    constructor(conversationRequestsRepo, userRepoReader, mapToRequestDto, cacheService) {
        this.conversationRequestsRepo = conversationRequestsRepo;
        this.userRepoReader = userRepoReader;
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
    ensureReqNotDeleted(request) {
        if (request.getIsDeleted()) {
            throw new conversation_requests_errors_1.ConversationRequestsNotFoundError("Request has been deleted");
        }
    }
    ensureIsRequestOwner(request, userId) {
        if (request.getUserId() !== userId) {
            throw new participant_errors_1.InsufficientPermissionsError("You are not allowed to view this request");
        }
    }
    async getSpecificRequestUserUseCase(actorId, requestId) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        const cacheKey = `conv_request:specific:${requestId}`;
        return await this.cacheService.remember(cacheKey, 60, async () => {
            const request = await this.ensureRequestExists(requestId);
            this.ensureReqNotDeleted(request);
            this.ensureIsRequestOwner(request, actorId);
            return this.mapToRequestDto.mapToRequestDto(request);
        });
    }
}
exports.GetSpecificRequestUserUseCase = GetSpecificRequestUserUseCase;
