"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveConversationTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const leave_conversation_use_case_1 = require("../../application/participant/leave_conversation_use_case");
const container_1 = require("../../../../container");
class LeaveConversationTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async leaveConversationTxService(actorId, conversationId) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const leaveConversationUseCase = new leave_conversation_use_case_1.LeaveConversationUseCase(participantRepo, container_1.RedisCacheService);
            return await leaveConversationUseCase.leaveConversationUseCase(actorId, conversationId);
        });
    }
}
exports.LeaveConversationTxService = LeaveConversationTxService;
