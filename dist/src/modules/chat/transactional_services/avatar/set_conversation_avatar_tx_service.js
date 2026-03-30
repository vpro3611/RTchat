"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetConversationAvatarTxService = void 0;
const avatar_repository_pg_1 = require("../../repositories_pg_realization/avatar_repository_pg");
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const sharp_image_processor_1 = require("../../infrasctructure/image_processor/sharp_image_processor");
const set_conversation_avatar_use_case_1 = require("../../application/avatar/set_conversation_avatar_use_case");
const container_1 = require("../../../../container");
class SetConversationAvatarTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async setConversationAvatar(conversationId, userId, fileBuffer) {
        return this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const avatarRepo = new avatar_repository_pg_1.AvatarRepositoryPg(client);
            const imageProcessor = new sharp_image_processor_1.ImageProcessor();
            const useCase = new set_conversation_avatar_use_case_1.SetConversationAvatarUseCase(conversationRepo, participantRepo, avatarRepo, imageProcessor, container_1.RedisCacheService);
            return await useCase.execute(conversationId, userId, fileBuffer);
        });
    }
}
exports.SetConversationAvatarTxService = SetConversationAvatarTxService;
