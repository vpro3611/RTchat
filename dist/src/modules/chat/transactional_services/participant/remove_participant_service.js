"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveParticipantTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const remove_participant_use_case_1 = require("../../application/participant/remove_participant_use_case");
const container_1 = require("../../../../container");
class RemoveParticipantTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async removeParticipantTxService(actorId, conversationId, targetId) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const removeParticipantUseCase = new remove_participant_use_case_1.RemoveParticipantUseCase(participantRepo, container_1.RedisCacheService);
            return await removeParticipantUseCase.removeParticipantUseCase(actorId, conversationId, targetId);
        });
    }
}
exports.RemoveParticipantTxService = RemoveParticipantTxService;
