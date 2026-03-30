"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificParticipantService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const get_specific_participant_use_case_1 = require("../../application/participant/get_specific_participant_use_case");
const container_1 = require("../../../../container");
class GetSpecificParticipantService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSpecificParticipantService(actorId, conversationId, targetId) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const getSpecificParticipantUseCase = new get_specific_participant_use_case_1.GetSpecificParticipantUseCase(participantRepo, container_1.RedisCacheService);
            return getSpecificParticipantUseCase.getSpecificParticipantUseCase(actorId, conversationId, targetId);
        });
    }
}
exports.GetSpecificParticipantService = GetSpecificParticipantService;
