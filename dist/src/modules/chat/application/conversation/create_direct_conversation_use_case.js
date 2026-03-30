"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDirectConversationUseCase = void 0;
const conversation_1 = require("../../domain/conversation/conversation");
const participant_1 = require("../../domain/participant/participant");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
class CreateDirectConversationUseCase {
    conversationRepo;
    participantRepo;
    conversationMapper;
    cacheService;
    userToUserBansRepo;
    constructor(conversationRepo, participantRepo, conversationMapper, cacheService, userToUserBansRepo) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.conversationMapper = conversationMapper;
        this.cacheService = cacheService;
        this.userToUserBansRepo = userToUserBansRepo;
    }
    checkForSelf(actorId, targetId) {
        if (actorId === targetId) {
            throw new conversation_errors_1.CannotCreateConversationError("Cannot create a conversation with yourself");
        }
    }
    async invalidateUserConversationsCache(...userIds) {
        for (const id of userIds) {
            await this.cacheService.delByPattern(`conv:user:${id}:*`);
        }
    }
    async checkForBlockingRelations(actorId, targetId) {
        const relation = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (relation) {
            throw new conversation_errors_1.CannotCreateConversationError("Cannot create a conversation with a blocked user");
        }
    }
    async createDirectConversationUseCase(actorId, targetId) {
        this.checkForSelf(actorId, targetId);
        await this.checkForBlockingRelations(actorId, targetId);
        const existingConversation = await this.conversationRepo.findDirectConversation(actorId, targetId);
        if (existingConversation) {
            return this.conversationMapper.mapToConversationDto(existingConversation);
        }
        const conversation = conversation_1.Conversation.createDirect(actorId, actorId, targetId);
        await this.conversationRepo.create(conversation);
        const participantA = participant_1.Participant.createAsMember(conversation.id, actorId);
        const participantB = participant_1.Participant.createAsMember(conversation.id, targetId);
        await this.participantRepo.save(participantA);
        await this.participantRepo.save(participantB);
        // cache invalidation
        await this.invalidateUserConversationsCache(actorId, targetId);
        return this.conversationMapper.mapToConversationDto(conversation);
    }
}
exports.CreateDirectConversationUseCase = CreateDirectConversationUseCase;
