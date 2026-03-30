"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBannedUsersService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
const get_banned_users_use_case_1 = require("../../application/participant/get_banned_users_use_case");
const container_1 = require("../../../../container");
class GetBannedUsersService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getBannedUsersService(actorId, conversationId) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const getBannedUsersUseCase = new get_banned_users_use_case_1.GetBannedUsersUseCase(participantRepo, conversationBansRepo, container_1.RedisCacheService);
            return await getBannedUsersUseCase.getBannedUsersUseCase(conversationId, actorId);
        });
    }
}
exports.GetBannedUsersService = GetBannedUsersService;
