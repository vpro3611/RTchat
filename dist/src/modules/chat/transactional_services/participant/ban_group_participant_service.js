"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanGroupParticipantService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
const ban_group_participant_use_case_1 = require("../../application/participant/ban_group_participant_use_case");
const container_1 = require("../../../../container");
class BanGroupParticipantService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async banGroupParticipantService(conversationId, targetId, actorId, reason) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const banGroupParticipantUseCase = new ban_group_participant_use_case_1.BanGroupParticipantUseCase(participantRepo, conversationBansRepo, container_1.RedisCacheService);
            return await banGroupParticipantUseCase.banGroupParticipantUseCase({
                conversationId: conversationId,
                userId: targetId,
                bannedBy: actorId,
                reason: reason
            });
        });
    }
}
exports.BanGroupParticipantService = BanGroupParticipantService;
