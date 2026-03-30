"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteParticipantTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const map_to_participant_dto_1 = require("../../shared/map_to_participant_dto");
const mute_participant_use_case_1 = require("../../application/participant/mute_participant_use_case");
const container_1 = require("../../../../container");
class MuteParticipantTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async muteParticipantTxService(actorId, targetId, conversationId, duration) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const participantMapper = new map_to_participant_dto_1.MapToParticipantDto();
            const muteParticipantUseCase = new mute_participant_use_case_1.MuteParticipantUseCase(participantRepo, participantMapper, container_1.RedisCacheService);
            return await muteParticipantUseCase.muteParticipantUseCase(actorId, targetId, conversationId, duration);
        });
    }
}
exports.MuteParticipantTxService = MuteParticipantTxService;
