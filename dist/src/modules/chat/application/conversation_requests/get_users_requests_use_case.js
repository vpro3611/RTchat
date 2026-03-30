"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersRequestsUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
class GetUsersRequestsUseCase {
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
    async getUsersRequestsUseCase(actorId, status) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        const cacheKey = `conv_requests:user:${actorId}:${status ?? 'all'}`;
        return await this.cacheService.remember(cacheKey, 60, async () => {
            const requests = await this.conversationRequestsRepo.getUsersRequests(actorId, status);
            return requests
                .filter((r) => !r.getIsDeleted())
                .map((r) => this.mapToRequestDto.mapToRequestDto(r));
        });
    }
}
exports.GetUsersRequestsUseCase = GetUsersRequestsUseCase;
