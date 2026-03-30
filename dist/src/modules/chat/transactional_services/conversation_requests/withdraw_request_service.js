"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawRequestService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const withdraw_request_use_case_1 = require("../../application/conversation_requests/withdraw_request_use_case");
const container_1 = require("../../../../container");
class WithdrawRequestService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async withdrawRequestService(actorId, requestId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const mapToRequestDto = new map_to_request_dto_1.MapToRequestDto();
            const withdrawRequestUseCase = new withdraw_request_use_case_1.WithdrawRequestUseCase(userRepoReader, conversationRequestsRepo, mapToRequestDto, container_1.RedisCacheService);
            return await withdrawRequestUseCase.withdrawRequestUseCase(actorId, requestId);
        });
    }
}
exports.WithdrawRequestService = WithdrawRequestService;
