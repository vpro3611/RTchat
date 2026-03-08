import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {CheckIsParticipant} from "../../shared/is_participant";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {Conversation} from "../../domain/conversation/conversation";
import {Participant} from "../../domain/participant/participant";
import {ConversationType} from "../../domain/conversation/conversation_type";
import {ParticipantRole} from "../../domain/participant/participant_role";
import {
    CannotUpdateTitleError,
    ConversationNotFoundError
} from "../errors/conversation_errors/conversation_errors";


export class UpdateConversationTitleUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly conversationMapper: MapToConversationDto,
    ) {}

    private async conversationExists(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }

    private ensureIsNotDirectConversation(conversation: Conversation) {
        if (conversation.getConversationType() === ConversationType.DIRECT) {
            throw new CannotUpdateTitleError("Cannot update title of a direct conversation");
        }
    }

    private enforceGroupConversationRules(conversation: Conversation, participant: Participant) {
        if (conversation.getConversationType() !== ConversationType.GROUP ||
            participant.getRole() !== ParticipantRole.OWNER ||
            !participant.getCanSendMessages()
        ) {
            throw new CannotUpdateTitleError("Cannot update title of a group conversation");
        }
    }

    async updateConversationTitleUseCase(actorId: string, conversationId: string, newTitle: string) {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        const conversation = await this.conversationExists(conversationId);

        this.ensureIsNotDirectConversation(conversation);

        this.enforceGroupConversationRules(conversation, participant);

        conversation.updateTitle(newTitle);

        return this.conversationMapper.mapToConversationDto(conversation);
    }
}