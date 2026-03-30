"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageUseCase = void 0;
const message_1 = require("../../domain/message/message");
const content_1 = require("../../domain/message/content");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
class SendMessageUseCase {
    messageRepo;
    conversationRepo;
    messageMapper;
    checkIsParticipant;
    cacheService;
    participantRepo;
    userToUserBansRepo;
    conversationBansRepo;
    constructor(messageRepo, conversationRepo, messageMapper, checkIsParticipant, cacheService, participantRepo, userToUserBansRepo, conversationBansRepo) {
        this.messageRepo = messageRepo;
        this.conversationRepo = conversationRepo;
        this.messageMapper = messageMapper;
        this.checkIsParticipant = checkIsParticipant;
        this.cacheService = cacheService;
        this.participantRepo = participantRepo;
        this.userToUserBansRepo = userToUserBansRepo;
        this.conversationBansRepo = conversationBansRepo;
    }
    async checkIfUserIsBannedFromGroup(actorId, conversationId) {
        const relation = await this.conversationBansRepo.isBanned(conversationId, actorId);
        if (relation) {
            throw new participant_errors_1.UserIsNotAllowedToPerformError("User is not allowed to send messages because of being blocked by the target user");
        }
    }
    async invalidateCache(participants) {
        for (const p of participants) {
            await this.cacheService.delByPattern(`conv:user:${p.userId}:*`);
        }
    }
    async checkForBlockingRelations(actorId, targetId) {
        const relation = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (relation) {
            throw new participant_errors_1.UserIsNotAllowedToPerformError("User is not allowed to send messages because of being blocked by the target user");
        }
    }
    async getConversation(conversationId) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new conversation_errors_1.CannotCreateConversationError("Conversation not found");
        }
        return conversation;
    }
    async sendMessageUseCase(actorId, conversationId, content) {
        const validatedContent = content_1.Content.create(content);
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);
        if (!participant.getCanSendMessages()) {
            throw new participant_errors_1.UserIsNotAllowedToPerformError("User is not allowed to send messages");
        }
        const conversation = await this.getConversation(conversationId);
        if (conversation.getConversationType() === "direct") {
            const participants = await this.participantRepo.getParticipants(conversationId);
            const target = participants.items.find(p => p.userId !== actorId);
            if (!target) {
                throw new participant_errors_1.UserIsNotParticipantError("User is not a participant of the conversation." +
                    " Cannot send message to a direct conversation without a target user");
            }
            await this.checkForBlockingRelations(actorId, target.userId);
        }
        if (conversation.getConversationType() === "group") {
            await this.checkIfUserIsBannedFromGroup(actorId, conversationId);
        }
        const message = message_1.Message.create(conversationId, actorId, validatedContent);
        await this.messageRepo.create(message);
        await this.conversationRepo.updateLastMessage(conversationId, message.getCreatedAt());
        // invalidate cache messages
        await this.cacheService.delByPattern(`messages:${conversationId}:*`);
        const participants = await this.participantRepo.getParticipants(conversationId);
        // invalidate user conversation list
        await this.invalidateCache(participants.items);
        return this.messageMapper.mapToMessage(message);
    }
}
exports.SendMessageUseCase = SendMessageUseCase;
