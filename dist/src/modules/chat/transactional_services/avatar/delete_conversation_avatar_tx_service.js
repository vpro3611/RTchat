"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteConversationAvatarTxService = void 0;
const avatar_repository_pg_1 = require("../../repositories_pg_realization/avatar_repository_pg");
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const delete_conversation_avatar_use_case_1 = require("../../application/avatar/delete_conversation_avatar_use_case");
const container_1 = require("../../../../container");
class DeleteConversationAvatarTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async deleteConversationAvatar(conversationId, userId) {
        return this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const avatarRepo = new avatar_repository_pg_1.AvatarRepositoryPg(client);
            const useCase = new delete_conversation_avatar_use_case_1.DeleteConversationAvatarUseCase(conversationRepo, participantRepo, avatarRepo, container_1.RedisCacheService);
            return await useCase.execute(conversationId, userId);
        });
    }
}
exports.DeleteConversationAvatarTxService = DeleteConversationAvatarTxService;
