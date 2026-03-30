"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateConversationRequestUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
const conversation_requests_errors_1 = require("../../errors/conversation_requests_errors/conversation_requests_errors");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
class CreateConversationRequestUseCase {
    userRepoReader;
    participantRepo;
    conversationRepo;
    conversationRepoBans;
    conversationRequestsRepo;
    conversationRequestsMapper;
    cacheService;
    constructor(userRepoReader, participantRepo, conversationRepo, conversationRepoBans, conversationRequestsRepo, conversationRequestsMapper, cacheService) {
        this.userRepoReader = userRepoReader;
        this.participantRepo = participantRepo;
        this.conversationRepo = conversationRepo;
        this.conversationRepoBans = conversationRepoBans;
        this.conversationRequestsRepo = conversationRequestsRepo;
        this.conversationRequestsMapper = conversationRequestsMapper;
        this.cacheService = cacheService;
    }
    async ensureUserExists(userId) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError("User not found");
        }
        return user;
    }
    async ensureConversationExists(conversationId) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new conversation_errors_1.ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }
    ensureIsGroup(conversation) {
        if (conversation.getConversationType() !== "group") {
            throw new conversation_requests_errors_1.ConversationRequestNotCreatedError("Cannot create a conversation request for a direct conversation");
        }
    }
    async ensureUserIsNotAlreadyParticipant(conversationId, userId) {
        const participant = await this.participantRepo.findParticipant(conversationId, userId);
        if (participant) {
            throw new conversation_requests_errors_1.ConversationRequestNotCreatedError("User is already a member of the conversation");
        }
    }
    async ensureNoBannedRelationsExists(conversationId, userId) {
        const banned = await this.conversationRepoBans.isBanned(conversationId, userId);
        if (banned) {
            throw new conversation_requests_errors_1.ConversationRequestNotCreatedError("User is banned from the conversation; could not send a request");
        }
    }
    async invalidateCaches(conversationId, userId) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
        ]);
    }
    async createConversationRequestUseCase(actorId, conversationId, requestMessage) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        const conversation = await this.ensureConversationExists(conversationId);
        this.ensureIsGroup(conversation);
        await this.ensureUserIsNotAlreadyParticipant(conversationId, actorId);
        await this.ensureNoBannedRelationsExists(conversationId, actorId);
        const newRequest = conversation_requests_1.ConversationRequests.create(conversationId, actorId, requestMessage);
        await this.conversationRequestsRepo.create(newRequest);
        await this.invalidateCaches(conversationId, actorId);
        return this.conversationRequestsMapper.mapToRequestDto(newRequest);
    }
}
exports.CreateConversationRequestUseCase = CreateConversationRequestUseCase;
