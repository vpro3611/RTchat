"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestStatusService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const change_request_status_use_case_1 = require("../../application/conversation_requests/change_request_status_use_case");
const container_1 = require("../../../../container");
class ChangeRequestStatusService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async changeRequestStatusService(actorId, conversationId, requestId, reviewMessage, status) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const requestMapper = new map_to_request_dto_1.MapToRequestDto();
            const changeRequestStatusUseCase = new change_request_status_use_case_1.ChangeRequestStatusUseCase(participantRepo, conversationRequestsRepo, requestMapper, container_1.RedisCacheService);
            return await changeRequestStatusUseCase.changeRequestStatusUseCase(actorId, conversationId, requestId, reviewMessage, status);
        });
    }
}
exports.ChangeRequestStatusService = ChangeRequestStatusService;
