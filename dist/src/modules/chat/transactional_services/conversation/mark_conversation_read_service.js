"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkConversationReadTxService = void 0;
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const mark_conversation_read_use_case_1 = require("../../application/conversation/mark_conversation_read_use_case");
class MarkConversationReadTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async markConversationReadTxService(actorId, conversationId, messageId) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const markConversationReadUseCase = new mark_conversation_read_use_case_1.MarkConversationReadUseCase(conversationRepo, participantRepo);
            return await markConversationReadUseCase.markConversationReadUseCase(actorId, conversationId, messageId);
        });
    }
}
exports.MarkConversationReadTxService = MarkConversationReadTxService;
