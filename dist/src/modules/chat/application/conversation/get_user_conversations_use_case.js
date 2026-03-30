"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserConversationsUseCase = void 0;
class GetUserConversationsUseCase {
    conversationRepo;
    conversationMapper;
    cacheService;
    constructor(conversationRepo, conversationMapper, cacheService) {
        this.conversationRepo = conversationRepo;
        this.conversationMapper = conversationMapper;
        this.cacheService = cacheService;
    }
    async getUserConversationsUseCase(actorId, limit, cursor) {
        const cacheKey = `conv:user:${actorId}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;
        return this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.conversationRepo.getUserConversations(actorId, limit, cursor);
            return {
                items: result.items.map(conversation => this.conversationMapper.mapToConversationDto(conversation)),
                nextCursor: result.nextCursor,
            };
        });
    }
}
exports.GetUserConversationsUseCase = GetUserConversationsUseCase;
