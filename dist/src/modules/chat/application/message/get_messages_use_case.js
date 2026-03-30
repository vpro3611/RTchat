"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMessagesUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class GetMessagesUseCase {
    messageRepo;
    messageMapper;
    cacheService;
    participantRepo;
    constructor(messageRepo, messageMapper, cacheService, participantRepo) {
        this.messageRepo = messageRepo;
        this.messageMapper = messageMapper;
        this.cacheService = cacheService;
        this.participantRepo = participantRepo;
    }
    async actorIsParticipant(actorId, conversationId) {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }
    async getMessagesUseCase(actorId, conversationId, limit, cursor) {
        const cacheKey = `messages:${conversationId}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;
        await this.actorIsParticipant(actorId, conversationId);
        return this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.messageRepo.findByConversationId(conversationId, limit, cursor);
            return {
                items: result.items.map(message => this.messageMapper.mapToMessage(message)),
                nextCursor: result.nextCursor,
            };
        });
    }
}
exports.GetMessagesUseCase = GetMessagesUseCase;
