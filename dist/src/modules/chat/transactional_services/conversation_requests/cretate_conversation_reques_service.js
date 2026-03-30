"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateConversationRequestService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
const conversation_requests_repository_pg_1 = require("../../repositories_pg_realization/conversation_requests_repository_pg");
const map_to_request_dto_1 = require("../../shared/map_to_request_dto");
const create_conversation_request_use_case_1 = require("../../application/conversation_requests/create_conversation_request_use_case");
const container_1 = require("../../../../container");
class CreateConversationRequestService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async createConversationRequestService(actorId, conversationId, requestMessage) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const conversationRepoBans = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(client);
            const conversationRequestMapper = new map_to_request_dto_1.MapToRequestDto();
            const createConversationRequestUseCase = new create_conversation_request_use_case_1.CreateConversationRequestUseCase(userRepoReader, participantRepo, conversationRepo, conversationRepoBans, conversationRequestsRepo, conversationRequestMapper, container_1.RedisCacheService);
            return await createConversationRequestUseCase.createConversationRequestUseCase(actorId, conversationId, requestMessage);
        });
    }
}
exports.CreateConversationRequestService = CreateConversationRequestService;
