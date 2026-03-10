import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";


export class MarkConversationReadUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly participantRepo: ParticipantRepoInterface
    ) {}

    private async actorIsParticipant(conversationId: string, actorId: string) {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }

    async markConversationReadUseCase(actorId: string, conversationId: string, messageId: string) {
        await this.actorIsParticipant(conversationId, actorId);

        await this.conversationRepo.markRead(conversationId, actorId, messageId);
    }
}