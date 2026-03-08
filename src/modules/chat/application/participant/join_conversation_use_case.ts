import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationNotFoundError} from "../errors/conversation_errors/conversation_errors";
import {Participant} from "../../domain/participant/participant";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {ParticipantDTO} from "../../DTO/participant_dto";
import {
    CannotJoinDirectConversationError,
    UserAlreadyParticipantError
} from "../errors/participants_errors/participant_errors";
import {Conversation} from "../../domain/conversation/conversation";
import {ConversationType} from "../../domain/conversation/conversation_type";

export class JoinConversationUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly participantMapper: MapToParticipantDto,
    ) {}

    private async checkIfConversationExists(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }

    private async checkIfUserExists(conversationId: string, userId: string) {
        const exists = await this.participantRepo.exists(conversationId, userId);

        if (exists) {
            throw new UserAlreadyParticipantError("User already joined the conversation");
        }
    }

    private checkForGroupConversation(conversation: Conversation) {
        if (conversation.getConversationType() === ConversationType.DIRECT) {
            throw new CannotJoinDirectConversationError("Cannot join a direct conversation | Seek for groups to join");
        }
    }

    async joinConversationUseCase(actorId: string, conversationId: string): Promise<ParticipantDTO> {
        const conversation = await this.checkIfConversationExists(conversationId);

        this.checkForGroupConversation(conversation);

        await this.checkIfUserExists(conversationId, actorId);

        const participant = Participant.createAsMember(conversationId, actorId);

        await this.participantRepo.save(participant);

        return this.participantMapper.mapToParticipantDto(participant);
    }
}