"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveMessageUseCase = void 0;
const message_errors_1 = require("../../errors/message_errors/message_errors");
const http_errors_base_1 = require("../../../../http_errors_base");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const saved_messages_1 = require("../../domain/saved_messages/saved_messages");
class SaveMessageUseCase {
    participantRepo;
    savedMessageRepo;
    messageRepo;
    mapToSavedMessageDto;
    cacheService;
    constructor(participantRepo, savedMessageRepo, messageRepo, mapToSavedMessageDto, cacheService) {
        this.participantRepo = participantRepo;
        this.savedMessageRepo = savedMessageRepo;
        this.messageRepo = messageRepo;
        this.mapToSavedMessageDto = mapToSavedMessageDto;
        this.cacheService = cacheService;
    }
    async ensureActorIsParticipant(conversationId, actorId) {
        const actor = await this.participantRepo.exists(conversationId, actorId);
        if (!actor) {
            throw new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
    }
    async ensureMessageExists(messageId) {
        const message = await this.messageRepo.findById(messageId);
        if (!message) {
            throw new message_errors_1.MessageNotFoundError("Message not found");
        }
        return message;
    }
    ensureIsSameConversation(message, conversationId) {
        if (message.getConversationId() !== conversationId) {
            throw new message_errors_1.MessageNotFoundError("Message not found in the given conversation context");
        }
    }
    ensureIsNotDeleted(message) {
        if (message.getIsDeleted()) {
            throw new http_errors_base_1.ConflictError("Deleted messages cannot be saved");
        }
    }
    async ensureSavedDoesNotExists(messageId, actorId) {
        const savedExists = await this.savedMessageRepo.isSaved(messageId, actorId);
        if (savedExists) {
            throw new http_errors_base_1.ConflictError("Message already saved; cannot save it again");
        }
    }
    async saveMessageUseCase(actorId, messageId, conversationId) {
        await this.ensureActorIsParticipant(conversationId, actorId);
        const message = await this.ensureMessageExists(messageId);
        await this.ensureSavedDoesNotExists(messageId, actorId);
        this.ensureIsSameConversation(message, conversationId);
        this.ensureIsNotDeleted(message);
        const newSavedMessage = saved_messages_1.SavedMessages.create(actorId, messageId, conversationId, message.getSenderId(), message.getContent().getContentValue(), message.getCreatedAt(), message.getUpdatedAt());
        await this.savedMessageRepo.saveMessage(newSavedMessage);
        await this.cacheService.delByPattern(`saved_messages:list:user:${actorId}:*`);
        return this.mapToSavedMessageDto.mapToSavedMessageDto(newSavedMessage);
    }
}
exports.SaveMessageUseCase = SaveMessageUseCase;
