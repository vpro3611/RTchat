"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConversationTitleUseCase = void 0;
const conversation_type_1 = require("../../domain/conversation/conversation_type");
const participant_role_1 = require("../../domain/participant/participant_role");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
class UpdateConversationTitleUseCase {
    conversationRepo;
    checkIsParticipant;
    conversationMapper;
    cacheService;
    participantRepo;
    constructor(conversationRepo, checkIsParticipant, conversationMapper, cacheService, participantRepo) {
        this.conversationRepo = conversationRepo;
        this.checkIsParticipant = checkIsParticipant;
        this.conversationMapper = conversationMapper;
        this.cacheService = cacheService;
        this.participantRepo = participantRepo;
    }
    async conversationExists(conversationId) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new conversation_errors_1.ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }
    ensureIsNotDirectConversation(conversation) {
        if (conversation.getConversationType() === conversation_type_1.ConversationType.DIRECT) {
            throw new conversation_errors_1.CannotUpdateTitleError("Cannot update title of a direct conversation");
        }
    }
    enforceGroupConversationRules(conversation, participant) {
        if (conversation.getConversationType() !== conversation_type_1.ConversationType.GROUP ||
            participant.getRole() !== participant_role_1.ParticipantRole.OWNER ||
            !participant.getCanSendMessages()) {
            throw new conversation_errors_1.CannotUpdateTitleError("Cannot update title of a group conversation");
        }
    }
    async invalidateUserConversationCache(userIds) {
        for (const id of userIds) {
            await this.cacheService.delByPattern(`conv:user:${id}:*`);
        }
    }
    async updateConversationTitleUseCase(actorId, conversationId, newTitle) {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);
        const conversation = await this.conversationExists(conversationId);
        this.ensureIsNotDirectConversation(conversation);
        this.enforceGroupConversationRules(conversation, participant);
        conversation.updateTitle(newTitle);
        await this.conversationRepo.update(conversation);
        const participants = await this.participantRepo.getParticipants(conversationId);
        const userIds = participants.items.map(p => p.userId);
        await this.invalidateUserConversationCache(userIds);
        return this.conversationMapper.mapToConversationDto(conversation);
    }
}
exports.UpdateConversationTitleUseCase = UpdateConversationTitleUseCase;
