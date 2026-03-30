import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {SavedMessagesRepoInterface} from "../../domain/ports/saved_messages_repo_interface";
import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {SavedMessageDTO} from "../../DTO/saved_message_dto";
import {MessageNotFoundError} from "../../errors/message_errors/message_errors";
import {ConflictError} from "../../../../http_errors_base";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {SavedMessages} from "../../domain/saved_messages/saved_messages";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";
import {Message} from "../../domain/message/message";


export class SaveMessageUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly savedMessageRepo: SavedMessagesRepoInterface,
                private readonly messageRepo: MessageRepoInterface,
                private readonly mapToSavedMessageDto: MapToSavedMessageDto,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async ensureActorIsParticipant(conversationId: string, actorId: string) {
        const actor = await this.participantRepo.exists(conversationId, actorId);
        if (!actor) {
            throw new ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
    }

    private async ensureMessageExists(messageId: string) {
        const message = await this.messageRepo.findById(messageId);
        if (!message) {
            throw new MessageNotFoundError("Message not found");
        }
        return message;
    }

    private ensureIsSameConversation(message: Message, conversationId: string) {
        if (message.getConversationId() !== conversationId) {
            throw new MessageNotFoundError("Message not found in the given conversation context");
        }
    }

    private ensureIsNotDeleted(message: Message) {
        if (message.getIsDeleted()) {
            throw new ConflictError("Deleted messages cannot be saved");
        }
    }

    private async ensureSavedDoesNotExists(messageId: string, actorId: string) {
        const savedExists = await this.savedMessageRepo.isSaved(messageId, actorId);
        if (savedExists) {
            throw new ConflictError("Message already saved; cannot save it again");
        }

    }


    async saveMessageUseCase(
        actorId: string,
        messageId: string,
        conversationId: string,
    ) {

        await this.ensureActorIsParticipant(conversationId, actorId);

        const message = await this.ensureMessageExists(messageId);

        await this.ensureSavedDoesNotExists(messageId, actorId);

        this.ensureIsSameConversation(message, conversationId);

        this.ensureIsNotDeleted(message);

        const newSavedMessage = SavedMessages.create(
            actorId,
            messageId,
            conversationId,
            message.getSenderId(),
            message.getContent().getContentValue(),
            message.getCreatedAt(),
            message.getUpdatedAt(),
        );

        await this.savedMessageRepo.saveMessage(newSavedMessage);

        await this.cacheService.delByPattern(`saved_messages:list:user:${actorId}:*`);

        return this.mapToSavedMessageDto.mapToSavedMessageDto(newSavedMessage);

    }
}