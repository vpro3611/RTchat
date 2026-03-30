"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUsersUseCase = void 0;
class SearchUsersUseCase {
    userRepoReader;
    userLookup;
    userMapper;
    cacheService;
    constructor(userRepoReader, userLookup, userMapper, cacheService) {
        this.userRepoReader = userRepoReader;
        this.userLookup = userLookup;
        this.userMapper = userMapper;
        this.cacheService = cacheService;
    }
    async searchUsersUseCase(actorId, query, limit, cursor) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();
        const cacheKey = `users:search:${query}:${limit}:${cursor}`;
        return this.cacheService.remember(cacheKey, 60, async () => {
            const users = await this.userRepoReader.searchUsers(query, limit, cursor);
            return {
                items: users.items.map(user => this.userMapper.mapToDto(user)),
                nextCursor: users.nextCursor,
            };
        });
    }
}
exports.SearchUsersUseCase = SearchUsersUseCase;
