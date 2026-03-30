"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificRequestGroupService = void 0;
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const get_specific_request_group_use_case_1 = require("../../application/conversation_requests/get_specific_request_group_use_case");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const container_1 = require("../../../../container");
class GetSpecificRequestGroupService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSpecificRequestGroupService(actorId, conversationId, requestId) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const requestMapper = new map_to_request_dto_1.MapToRequestDto();
            const getSpecificRequestGroupUseCase = new get_specific_request_group_use_case_1.GetSpecificRequestGroupUseCase(participantRepo, conversationRequestsRepo, requestMapper, container_1.RedisCacheService);
            return await getSpecificRequestGroupUseCase.getSpecificRequestGroupUseCase(actorId, conversationId, requestId);
        });
    }
}
exports.GetSpecificRequestGroupService = GetSpecificRequestGroupService;
