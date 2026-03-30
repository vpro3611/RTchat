"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditMessageUseCase = void 0;
const message_errors_1 = require("../../errors/message_errors/message_errors");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class EditMessageUseCase {
    messageRepo;
    messageMapper;
    checkIsParticipant;
    findMessageById;
    cacheService;
    constructor(messageRepo, messageMapper, checkIsParticipant, findMessageById, cacheService) {
        this.messageRepo = messageRepo;
        this.messageMapper = messageMapper;
        this.checkIsParticipant = checkIsParticipant;
        this.findMessageById = findMessageById;
        this.cacheService = cacheService;
    }
    checkMessage(message, participant) {
        if (message.getSenderId() !== participant.userId) {
            throw new participant_errors_1.UserIsNotAnAuthorError("User is not the author of the message");
        }
        if (message.getConversationId() !== participant.getConversationId()) {
            throw new message_errors_1.MessageNotAPartOfConversationError("This message is not part of the conversation");
        }
    }
    checkIfCanEditMessages(participant) {
        if (!participant.getCanSendMessages()) {
            throw new participant_errors_1.UserIsNotAllowedToPerformError("User is not allowed to edit message");
        }
    }
    async editMessageUseCase(actorId, conversationId, messageId, newContent) {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);
        this.checkIfCanEditMessages(participant);
        const message = await this.findMessageById.findMessageById(messageId);
        this.checkMessage(message, participant);
        message.editMessage(newContent);
        await this.messageRepo.update(message);
        await this.cacheService.delByPattern(`messages:${conversationId}:*`);
        return this.messageMapper.mapToMessage(message);
    }
}
exports.EditMessageUseCase = EditMessageUseCase;
