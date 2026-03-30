"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinConversationTxService = void 0;
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const join_conversation_use_case_1 = require("../../application/participant/join_conversation_use_case");
const container_1 = require("../../../../container");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
class JoinConversationTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async joinConversationTxService(actorId, conversationId) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const requestMapper = new map_to_request_dto_1.MapToRequestDto();
            const joinConversationUseCase = new join_conversation_use_case_1.JoinConversationUseCase(conversationRepo, participantRepo, container_1.RedisCacheService, conversationBansRepo, conversationRequestsRepo, requestMapper);
            return await joinConversationUseCase.joinConversationUseCase(actorId, conversationId);
        });
    }
}
exports.JoinConversationTxService = JoinConversationTxService;
