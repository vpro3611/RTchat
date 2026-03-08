import {ParticipantRepoInterface} from "../domain/ports/participant_repo_interface";


export class CheckIsParticipant {
    constructor(private readonly participantRepo: ParticipantRepoInterface) {
    }
    async checkIsParticipant(actorId: string, conversationId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new Error("User is not a participant of the conversation");
        }
        return participant;
    }
}