"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinConversationUseCase = void 0;
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const conversation_type_1 = require("../../domain/conversation/conversation_type");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
class JoinConversationUseCase {
    conversationRepo;
    participantRepo;
    cacheService;
    conversationBansRepo;
    conversationRequestsRepo;
    requestMapper;
    constructor(conversationRepo, participantRepo, cacheService, conversationBansRepo, conversationRequestsRepo, requestMapper) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.cacheService = cacheService;
        this.conversationBansRepo = conversationBansRepo;
        this.conversationRequestsRepo = conversationRequestsRepo;
        this.requestMapper = requestMapper;
    }
    async checkIfIsBanned(actorId, conversationId) {
        const exists = await this.conversationBansRepo.isBanned(conversationId, actorId);
        if (exists) {
            throw new participant_errors_1.UserIsNotAllowedToPerformError("User is banned from the conversation");
        }
    }
    async checkIfConversationExists(conversationId) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new conversation_errors_1.ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }
    async checkIfUserExists(conversationId, userId) {
        const exists = await this.participantRepo.exists(conversationId, userId);
        if (exists) {
            throw new participant_errors_1.UserAlreadyParticipantError("User already joined the conversation");
        }
    }
    checkForGroupConversation(conversation) {
        if (conversation.getConversationType() === conversation_type_1.ConversationType.DIRECT) {
            throw new participant_errors_1.CannotJoinDirectConversationError("Cannot join a direct conversation | Seek for groups to join");
        }
    }
    async invalidateRequestCaches(conversationId, userId) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
        ]);
    }
    async joinConversationUseCase(actorId, conversationId) {
        const conversation = await this.checkIfConversationExists(conversationId);
        await this.checkIfIsBanned(actorId, conversationId);
        this.checkForGroupConversation(conversation);
        await this.checkIfUserExists(conversationId, actorId);
        const newRequest = conversation_requests_1.ConversationRequests.create(conversationId, actorId, "User requested to join the conversation via Join button");
        await this.conversationRequestsRepo.create(newRequest);
        await this.invalidateRequestCaches(conversationId, actorId);
        return this.requestMapper.mapToRequestDto(newRequest);
    }
}
exports.JoinConversationUseCase = JoinConversationUseCase;
