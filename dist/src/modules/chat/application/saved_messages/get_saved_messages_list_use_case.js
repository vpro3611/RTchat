"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSavedMessagesListUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
class GetSavedMessagesListUseCase {
    userRepoReader;
    savedMessageRepo;
    mapToSavedMessageDto;
    cacheService;
    constructor(userRepoReader, savedMessageRepo, mapToSavedMessageDto, cacheService) {
        this.userRepoReader = userRepoReader;
        this.savedMessageRepo = savedMessageRepo;
        this.mapToSavedMessageDto = mapToSavedMessageDto;
        this.cacheService = cacheService;
    }
    async ensureUserExists(userId) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError("User not found");
        }
        return user;
    }
    async getSavedMessagesListUseCase(actorId, limit, cursor) {
        const safeLimit = Math.min(limit ?? 20, 50);
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        const cacheKey = `saved_messages:list:user:${actorId}:limit:${safeLimit}:cursor:${cursor ?? "none"}`;
        return await this.cacheService.remember(cacheKey, 60, async () => {
            const res = await this.savedMessageRepo.getSavedMessages(actorId, safeLimit, cursor);
            return {
                items: res.items.map(m => this.mapToSavedMessageDto.mapToSavedMessageDto(m)),
                nextCursor: res.nextCursor,
            };
        });
    }
}
exports.GetSavedMessagesListUseCase = GetSavedMessagesListUseCase;
