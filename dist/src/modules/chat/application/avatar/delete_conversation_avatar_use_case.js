"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteConversationAvatarUseCase = void 0;
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
const participant_role_1 = require("../../domain/participant/participant_role");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class DeleteConversationAvatarUseCase {
    conversationRepo;
    participantRepo;
    avatarRepo;
    cacheService;
    constructor(conversationRepo, participantRepo, avatarRepo, cacheService) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.avatarRepo = avatarRepo;
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
            throw new participant_errors_1.InsufficientPermissionsError("Only the owner can delete the conversation avatar");
        }
    }
    async execute(conversationId, userId) {
        const conversation = await this.ensureConversationExists(conversationId);
        await this.ensureUserIsParticipant(conversationId, userId);
        const avatarId = conversation.getAvatarId();
        if (!avatarId)
            return;
        await this.conversationRepo.updateAvatarId(conversationId, null);
        await this.avatarRepo.delete(avatarId);
        await this.cacheService.delByPattern("conv:user:*");
    }
}
exports.DeleteConversationAvatarUseCase = DeleteConversationAvatarUseCase;
