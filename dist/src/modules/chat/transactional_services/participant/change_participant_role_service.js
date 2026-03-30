"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeParticipantRoleTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const map_to_participant_dto_1 = require("../../shared/map_to_participant_dto");
const change_participant_role_use_case_1 = require("../../application/participant/change_participant_role_use_case");
const container_1 = require("../../../../container");
class ChangeParticipantRoleTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async changeParticipantRoleTxService(actorId, conversationId, targetId) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const participantMapper = new map_to_participant_dto_1.MapToParticipantDto();
            const changeParticipantRoleUseCase = new change_participant_role_use_case_1.ChangeParticipantRoleUseCase(participantRepo, participantMapper, container_1.RedisCacheService);
            return await changeParticipantRoleUseCase.changeParticipantRoleUseCase(actorId, conversationId, targetId);
        });
    }
}
exports.ChangeParticipantRoleTxService = ChangeParticipantRoleTxService;
