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
} from "../../errors/conversation_errors/conversation_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";


export class UpdateConversationTitleUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly conversationMapper: MapToConversationDto,
                private readonly cacheService: CacheServiceInterface,
                private readonly participantRepo: ParticipantRepoInterface,
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

    private async invalidateUserConversationCache(userIds: string[]) {
        for (const id of userIds) {
            await this.cacheService.delByPattern(`conv:user:${id}:*`);
        }
    }

    async updateConversationTitleUseCase(actorId: string, conversationId: string, newTitle: string) {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        const conversation = await this.conversationExists(conversationId);

        this.ensureIsNotDirectConversation(conversation);

        this.enforceGroupConversationRules(conversation, participant);

        conversation.updateTitle(newTitle);

        await this.conversationRepo.update(conversation);

        const participants = await this.participantRepo.getParticipants(conversationId);

        const userIds = participants.items.map(p => p.userId);

        await this.invalidateUserConversationCache(userIds);

        return this.conversationMapper.mapToConversationDto(conversation);
    }
}