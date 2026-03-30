"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificRequestUserService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const get_specific_request_user_use_case_1 = require("../../application/conversation_requests/get_specific_request_user_use_case");
const container_1 = require("../../../../container");
class GetSpecificRequestUserService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSpecificRequestUserService(actorId, requestId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const requestMapper = new map_to_request_dto_1.MapToRequestDto();
            const getSpecificRequestUserUseCase = new get_specific_request_user_use_case_1.GetSpecificRequestUserUseCase(conversationRequestsRepo, userRepoReader, requestMapper, container_1.RedisCacheService);
            return await getSpecificRequestUserUseCase.getSpecificRequestUserUseCase(actorId, requestId);
        });
    }
}
exports.GetSpecificRequestUserService = GetSpecificRequestUserService;
