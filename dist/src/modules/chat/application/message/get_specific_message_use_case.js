"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificMessageUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const message_errors_1 = require("../../errors/message_errors/message_errors");
class GetSpecificMessageUseCase {
    messageMapper;
    findMessageById;
    participantRepo;
    cacheService;
    constructor(messageMapper, findMessageById, participantRepo, cacheService) {
        this.messageMapper = messageMapper;
        this.findMessageById = findMessageById;
        this.participantRepo = participantRepo;
        this.cacheService = cacheService;
    }
    actorExists = async (conversationId, actorId) => {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
    };
    async getSpecificMessageUseCase(actorId, conversationId, messageId) {
        const cacheKey = `message:conv:${conversationId}:id:${messageId}`;
        await this.actorExists(conversationId, actorId);
        return this.cacheService.remember(cacheKey, 60, async () => {
            const message = await this.findMessageById.findMessageById(messageId);
            if (message.getConversationId() !== conversationId) {
                throw new message_errors_1.MessageNotAPartOfConversationError("Message not found in the given conversation context");
            }
            return this.messageMapper.mapToMessage(message);
        });
    }
}
exports.GetSpecificMessageUseCase = GetSpecificMessageUseCase;
