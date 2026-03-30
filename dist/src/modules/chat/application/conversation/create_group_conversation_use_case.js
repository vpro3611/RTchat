"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroupConversationUseCase = void 0;
const conversation_1 = require("../../domain/conversation/conversation");
const conversation_title_1 = require("../../domain/conversation/conversation_title");
const participant_1 = require("../../domain/participant/participant");
class CreateGroupConversationUseCase {
    conversationRepo;
    participantRepo;
    conversationMapper;
    cacheService;
    constructor(conversationRepo, participantRepo, conversationMapper, cacheService) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.conversationMapper = conversationMapper;
        this.cacheService = cacheService;
    }
    async createGroupConversationUseCase(title, actorId) {
        const validTitle = conversation_title_1.ConversationTitle.create(title);
        const conversation = conversation_1.Conversation.createGroup(validTitle, actorId);
        await this.conversationRepo.create(conversation);
        const owner = participant_1.Participant.createAsOwner(conversation.id, actorId);
        await this.participantRepo.save(owner);
        await this.cacheService.delByPattern(`conv:user:${actorId}:*`);
        return this.conversationMapper.mapToConversationDto(conversation);
    }
}
exports.CreateGroupConversationUseCase = CreateGroupConversationUseCase;
