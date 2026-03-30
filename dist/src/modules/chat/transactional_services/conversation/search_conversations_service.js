"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchConversationsService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const user_exists_by_id_1 = require("../../../users/shared/user_exists_by_id");
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const map_to_conversation_dto_1 = require("../../shared/map_to_conversation_dto");
const search_conversations_use_case_1 = require("../../application/conversation/search_conversations_use_case");
const container_1 = require("../../../../container");
class SearchConversationsService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async searchConversationsService(actorId, query, limit, cursor) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userLookup = new user_exists_by_id_1.UserLookup(userRepo);
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const conversationMapper = new map_to_conversation_dto_1.MapToConversationDto();
            const searchConversationUseCase = new search_conversations_use_case_1.SearchConversationUseCase(conversationRepo, userLookup, conversationMapper, container_1.RedisCacheService);
            return await searchConversationUseCase.searchConversationUseCase(actorId, query, limit, cursor);
        });
    }
}
exports.SearchConversationsService = SearchConversationsService;
