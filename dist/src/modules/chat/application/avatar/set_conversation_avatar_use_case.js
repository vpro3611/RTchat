"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetConversationAvatarUseCase = void 0;
const avatar_1 = require("../../domain/avatar/avatar");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
const participant_role_1 = require("../../domain/participant/participant_role");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class SetConversationAvatarUseCase {
    conversationRepo;
    participantRepo;
    avatarRepo;
    imageProcessor;
    cacheService;
    constructor(conversationRepo, participantRepo, avatarRepo, imageProcessor, cacheService) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.avatarRepo = avatarRepo;
        this.imageProcessor = imageProcessor;
        this.cacheService = cacheService;
    }
    async ensureConversationExists(conversationId) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new conversation_errors_1.ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }
    async ensureUserIsParticipant(conversationId, userId) {
        const participant = await this.participantRepo.findParticipant(conversationId, userId);
        if (!participant || participant.getRole() !== participant_role_1.ParticipantRole.OWNER) {
            throw new participant_errors_1.InsufficientPermissionsError("Only the owner can set the conversation avatar");
        }
        return participant;
    }
    async invalidateConversationCache() {
        // Поскольку мы не знаем всех участников, мы просто инвалидируем все кэши списков бесед
        // В реальном приложении лучше получить список ID участников и инвалидировать точечно.
        await this.cacheService.delByPattern("conv:user:*");
    }
    async execute(conversationId, userId, fileBuffer) {
        const conversation = await this.ensureConversationExists(conversationId);
        const participant = await this.ensureUserIsParticipant(conversationId, userId);
        const oldAvatarId = conversation.getAvatarId();
        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = avatar_1.Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);
        await this.conversationRepo.updateAvatarId(conversationId, newAvatarId);
        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }
        await this.invalidateConversationCache();
        return newAvatarId;
    }
}
exports.SetConversationAvatarUseCase = SetConversationAvatarUseCase;
