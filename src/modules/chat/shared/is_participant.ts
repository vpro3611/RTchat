import {ParticipantRepoInterface} from "../domain/ports/participant_repo_interface";
import {ParticipantNotFoundError} from "../application/errors/participants_errors/participant_errors";


export class CheckIsParticipant {
    constructor(private readonly participantRepo: ParticipantRepoInterface) {
    }
    async checkIsParticipant(actorId: string, conversationId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new ParticipantNotFoundError("User is not a participant of the conversation");
        }
        return participant;
    }
}