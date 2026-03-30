"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConversationTitleTxService = void 0;
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const is_participant_1 = require("../../shared/is_participant");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const map_to_conversation_dto_1 = require("../../shared/map_to_conversation_dto");
const update_conversation_title_use_case_1 = require("../../application/conversation/update_conversation_title_use_case");
const container_1 = require("../../../../container");
class UpdateConversationTitleTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async updateConversationTitleTxService(actorId, conversationId, newTitle) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const checkIsParticipant = new is_participant_1.CheckIsParticipant(participantRepo);
            const conversationMapper = new map_to_conversation_dto_1.MapToConversationDto();
            const updateConversationTitleUseCase = new update_conversation_title_use_case_1.UpdateConversationTitleUseCase(conversationRepo, checkIsParticipant, conversationMapper, container_1.RedisCacheService, participantRepo);
            return await updateConversationTitleUseCase.updateConversationTitleUseCase(actorId, conversationId, newTitle);
        });
    }
}
exports.UpdateConversationTitleTxService = UpdateConversationTitleTxService;
