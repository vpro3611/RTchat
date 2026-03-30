"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRequestService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const remove_request_use_case_1 = require("../../application/conversation_requests/remove_request_use_case");
const container_1 = require("../../../../container");
class RemoveRequestService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async removeRequestService(actorId, requestId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const removeRequestUseCase = new remove_request_use_case_1.RemoveRequestUseCase(userRepoReader, conversationRequestsRepo, container_1.RedisCacheService);
            return await removeRequestUseCase.removeRequestUseCase(actorId, requestId);
        });
    }
}
exports.RemoveRequestService = RemoveRequestService;
