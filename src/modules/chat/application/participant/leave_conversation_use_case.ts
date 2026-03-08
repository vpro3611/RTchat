import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ActorIsNotParticipantError} from "../errors/participants_errors/participant_errors";


export class LeaveConversationUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface) {}

    async leaveConversationUseCase(actorId: string, conversationId: string): Promise<void> {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
        await this.participantRepo.remove(conversationId, actorId);
    }
}