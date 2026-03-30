"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersRequestsService = void 0;
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const get_users_requests_use_case_1 = require("../../application/conversation_requests/get_users_requests_use_case");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const container_1 = require("../../../../container");
class GetUsersRequestsService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getUsersRequestsService(actorId, status) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const requestMapper = new map_to_request_dto_1.MapToRequestDto();
            const getUsersRequestsUseCase = new get_users_requests_use_case_1.GetUsersRequestsUseCase(userRepoReader, conversationRequestsRepo, requestMapper, container_1.RedisCacheService);
            return await getUsersRequestsUseCase.getUsersRequestsUseCase(actorId, status);
        });
    }
}
exports.GetUsersRequestsService = GetUsersRequestsService;
