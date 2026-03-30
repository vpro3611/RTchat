"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDirectConversationTxService = void 0;
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const map_to_conversation_dto_1 = require("../../shared/map_to_conversation_dto");
const create_direct_conversation_use_case_1 = require("../../application/conversation/create_direct_conversation_use_case");
const container_1 = require("../../../../container");
const user_to_user_blocks_pg_1 = require("../../../users/repositories/user_to_user_blocks_pg");
class CreateDirectConversationTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async createDirectConversationTxService(actorId, targetId) {
        return this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationMapper = new map_to_conversation_dto_1.MapToConversationDto();
            const userToUserBansRepo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
            const createDirectConversationUseCase = new create_direct_conversation_use_case_1.CreateDirectConversationUseCase(conversationRepo, participantRepo, conversationMapper, container_1.RedisCacheService, userToUserBansRepo);
            return await createDirectConversationUseCase.createDirectConversationUseCase(actorId, targetId);
        });
    }
}
exports.CreateDirectConversationTxService = CreateDirectConversationTxService;
