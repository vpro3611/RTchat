"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetParticipantsTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const get_participants_use_case_1 = require("../../application/participant/get_participants_use_case");
const container_1 = require("../../../../container");
class GetParticipantsTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getParticipantsTxService(actorId, conversationId, limit, cursor) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const getParticipantsUseCase = new get_participants_use_case_1.GetParticipantsUseCase(participantRepo, container_1.RedisCacheService);
            return await getParticipantsUseCase.getParticipantsUseCase(actorId, conversationId, limit, cursor);
        });
    }
}
exports.GetParticipantsTxService = GetParticipantsTxService;
