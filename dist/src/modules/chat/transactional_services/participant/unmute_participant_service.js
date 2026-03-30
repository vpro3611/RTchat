"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnmuteParticipantTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const unmute_participant_use_case_1 = require("../../application/participant/unmute_participant_use_case");
const map_to_participant_dto_1 = require("../../shared/map_to_participant_dto");
const container_1 = require("../../../../container");
class UnmuteParticipantTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async unmuteParticipantTxService(actorId, targetId, conversationId) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const participantMapper = new map_to_participant_dto_1.MapToParticipantDto();
            const unmuteParticipantUseCase = new unmute_participant_use_case_1.UnmuteParticipantUseCase(participantRepo, participantMapper, container_1.RedisCacheService);
            return await unmuteParticipantUseCase.unmuteParticipantUseCase(actorId, targetId, conversationId);
        });
    }
}
exports.UnmuteParticipantTxService = UnmuteParticipantTxService;
