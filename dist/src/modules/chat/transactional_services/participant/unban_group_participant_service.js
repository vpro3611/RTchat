"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnbanGroupParticipantService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
const unban_group_participant_use_case_1 = require("../../application/participant/unban_group_participant_use_case");
const container_1 = require("../../../../container");
class UnbanGroupParticipantService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async unbanGroupParticipantService(actorId, conversationId, targetId) {
        return this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const unbanGroupParticipantUseCase = new unban_group_participant_use_case_1.UnbanGroupParticipantUseCase(participantRepo, conversationBansRepo, container_1.RedisCacheService);
            return await unbanGroupParticipantUseCase.unbanGroupParticipantUseCase(conversationId, actorId, targetId);
        });
    }
}
exports.UnbanGroupParticipantService = UnbanGroupParticipantService;
