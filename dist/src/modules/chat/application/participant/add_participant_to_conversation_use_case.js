"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddParticipantToConversationUseCase = void 0;
const participant_1 = require("../../domain/participant/participant");
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
const http_errors_base_1 = require("../../../../http_errors_base");
class AddParticipantToConversationUseCase {
    userRepo;
    participantRepo;
    conversationBansRepo;
    participantMapper;
    conversationRepo;
    userToUserBansRepo;
    cacheService;
    constructor(userRepo, participantRepo, conversationBansRepo, participantMapper, conversationRepo, userToUserBansRepo, cacheService) {
        this.userRepo = userRepo;
        this.participantRepo = participantRepo;
        this.conversationBansRepo = conversationBansRepo;
        this.participantMapper = participantMapper;
        this.conversationRepo = conversationRepo;
        this.userToUserBansRepo = userToUserBansRepo;
        this.cacheService = cacheService;
    }
    // ADD CACHE
    async ensureUserExists(userId) {
        const user = await this.userRepo.getUserById(userId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError("User not found");
        }
        return user;
    }
    async ensureActorIsParticipant(conversationId, actorId) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new participant_errors_1.ActorIsNotParticipantError("Actor is not a participant of the conversation");
        }
        return participant;
    }
    ensureIsOwner(actor) {
        if (actor.getRole() !== "owner") {
            throw new participant_errors_1.InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }
    async checkUserToUserRelations(actorId, targetId) {
        const userToUserBlocks = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (userToUserBlocks) {
            throw new participant_errors_1.UserIsNotAllowedToPerformError("User is blocked by the target user");
        }
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
            throw new http_errors_base_1.ConflictError("Cannot add a participant to a direct conversation");
        }
    }
    async checkConversationBans(targetId, conversationId) {
        const conversationBans = await this.conversationBansRepo.isBanned(conversationId, targetId);
        if (conversationBans) {
            throw new http_errors_base_1.ConflictError("User is banned from the conversation");
        }
    }
    async ensureTargetIsNotAlreadyParticipant(conversationId, targetId) {
        const participant = await this.participantRepo.findParticipant(conversationId, targetId);
        if (participant) {
            throw new http_errors_base_1.ConflictError("User is already a participant of the conversation");
        }
    }
    async invalidateCaches(conversationId, userId) {
        await Promise.all([
            this.cacheService.delByPattern(`participants:conv:${conversationId}:*`),
            this.cacheService.delByPattern(`conv:user:${userId}:*`),
        ]);
    }
    async addParticipantToConversationUseCase(actorId, targetId, conversationId) {
        const user = await this.ensureUserExists(targetId);
        user.ensureIsVerifiedAndActive();
        const actor = await this.ensureActorIsParticipant(conversationId, actorId);
        this.ensureIsOwner(actor);
        await this.checkUserToUserRelations(actorId, targetId);
        const conversation = await this.ensureConversationExists(conversationId);
        this.ensureIsGroup(conversation);
        await this.checkConversationBans(targetId, conversationId);
        await this.ensureTargetIsNotAlreadyParticipant(conversationId, targetId);
        const newParticipant = participant_1.Participant.createAsMember(conversationId, targetId);
        await this.participantRepo.save(newParticipant);
        await this.invalidateCaches(conversationId, targetId);
        return this.participantMapper.mapToParticipantDto(newParticipant);
    }
}
exports.AddParticipantToConversationUseCase = AddParticipantToConversationUseCase;
