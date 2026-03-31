import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationNotFoundError} from "../../errors/conversation_errors/conversation_errors";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {ConversationDTO} from "../../DTO/conversation_dto";

export class GetSpecificConversationUseCase {
    constructor(
        private readonly conversationRepo: ConversationRepoInterface,
        private readonly participantRepo: ParticipantRepoInterface,
        private readonly mapper: MapToConversationDto
    ) {}

    async execute(actorId: string, conversationId: string): Promise<ConversationDTO> {
        const isParticipant = await this.participantRepo.exists(conversationId, actorId);
        
        if (!isParticipant) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }

        const conversation = await this.conversationRepo.findById(conversationId, actorId);
        
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }

        return this.mapper.mapToConversationDto(conversation);
    }
}
