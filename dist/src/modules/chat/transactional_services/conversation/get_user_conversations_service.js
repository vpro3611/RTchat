"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserConversationsTxService = void 0;
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const map_to_conversation_dto_1 = require("../../shared/map_to_conversation_dto");
const get_user_conversations_use_case_1 = require("../../application/conversation/get_user_conversations_use_case");
const container_1 = require("../../../../container");
class GetUserConversationsTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getUserConversationTxService(actorId, limit, cursor) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const conversationMapper = new map_to_conversation_dto_1.MapToConversationDto();
            const getUserConversationsUseCase = new get_user_conversations_use_case_1.GetUserConversationsUseCase(conversationRepo, conversationMapper, container_1.RedisCacheService);
            return await getUserConversationsUseCase.getUserConversationsUseCase(actorId, limit, cursor);
        });
    }
}
exports.GetUserConversationsTxService = GetUserConversationsTxService;
