"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroupConversationTxService = void 0;
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const map_to_conversation_dto_1 = require("../../shared/map_to_conversation_dto");
const create_group_conversation_use_case_1 = require("../../application/conversation/create_group_conversation_use_case");
const container_1 = require("../../../../container");
class CreateGroupConversationTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async createGroupConversationTxService(title, actorId) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationMapper = new map_to_conversation_dto_1.MapToConversationDto();
            const createGroupConversationUseCase = new create_group_conversation_use_case_1.CreateGroupConversationUseCase(conversationRepo, participantRepo, conversationMapper, container_1.RedisCacheService);
            return await createGroupConversationUseCase.createGroupConversationUseCase(title, actorId);
        });
    }
}
exports.CreateGroupConversationTxService = CreateGroupConversationTxService;
