"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchConversationUseCase = void 0;
class SearchConversationUseCase {
    conversationRepo;
    userLookup;
    conversationMapper;
    cacheService;
    constructor(conversationRepo, userLookup, conversationMapper, cacheService) {
        this.conversationRepo = conversationRepo;
        this.userLookup = userLookup;
        this.conversationMapper = conversationMapper;
        this.cacheService = cacheService;
    }
    async searchConversationUseCase(actorId, query, limit, cursor) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();
        const cacheKey = `search:conv:query:${query}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;
        return this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.conversationRepo.searchConversations(query, limit, cursor);
            return {
                items: result.items.map(conversation => this.conversationMapper.mapToConversationDto(conversation)),
                nextCursor: result.nextCursor,
            };
        });
    }
}
exports.SearchConversationUseCase = SearchConversationUseCase;
