"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkConversationReadUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class MarkConversationReadUseCase {
    conversationRepo;
    participantRepo;
    constructor(conversationRepo, participantRepo) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
    }
    async actorIsParticipant(conversationId, actorId) {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }
    async markConversationReadUseCase(actorId, conversationId, messageId) {
        await this.actorIsParticipant(conversationId, actorId);
        await this.conversationRepo.markRead(conversationId, actorId, messageId);
    }
}
exports.MarkConversationReadUseCase = MarkConversationReadUseCase;
