"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckIsParticipant = void 0;
const participant_errors_1 = require("../errors/participants_errors/participant_errors");
class CheckIsParticipant {
    participantRepo;
    constructor(participantRepo) {
        this.participantRepo = participantRepo;
    }
    async checkIsParticipant(actorId, conversationId) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new participant_errors_1.ParticipantNotFoundError("User is not a participant of the conversation");
        }
        return participant;
    }
}
exports.CheckIsParticipant = CheckIsParticipant;
