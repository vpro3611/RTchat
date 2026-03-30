"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllRequestListService = void 0;
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const get_all_requst_list_use_case_1 = require("../../application/conversation_requests/get_all_requst_list_use_case");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const container_1 = require("../../../../container");
class GetAllRequestListService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getAllRequestListService(actorId, conversationId, status) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const requestMapper = new map_to_request_dto_1.MapToRequestDto();
            const getAllRequestListUseCase = new get_all_requst_list_use_case_1.GetAllRequestListUseCase(participantRepo, conversationRequestsRepo, requestMapper, container_1.RedisCacheService);
            return await getAllRequestListUseCase.getAllRequestsListUseCase(actorId, conversationId, status);
        });
    }
}
exports.GetAllRequestListService = GetAllRequestListService;
