import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {MapToMessage} from "../../shared/map_to_message";
import {MessageDTO} from "../../DTO/message_dto";
import {CheckIsParticipant} from "../../shared/is_participant";
import {FindMessageById} from "../../shared/find_message_by_id";
import {Message} from "../../domain/message/message";
import {Participant} from "../../domain/participant/participant";
import {MessageNotAPartOfConversationError} from "../../errors/message_errors/message_errors";
import {UserIsNotAllowedToPerformError, UserIsNotAnAuthorError} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";


export class EditMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly findMessageById: FindMessageById,
                private readonly cacheService: CacheServiceInterface,
                private readonly conversationRepo: ConversationRepoInterface,
    ) {}

    private checkMessage(message: Message, participant: Participant) {
        if (message.getSenderId() !== participant.userId) {
            throw new UserIsNotAnAuthorError("User is not the author of the message");
        }
        if (message.getConversationId() !== participant.getConversationId()) {
            throw new MessageNotAPartOfConversationError("This message is not part of the conversation");
        }
    }

    private checkIfCanEditMessages(participant: Participant) {
        if (!participant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to edit message");
        }
    }

    async editMessageUseCase(actorId: string, conversationId: string, messageId: string, newContent: string): Promise<MessageDTO> {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        this.checkIfCanEditMessages(participant);

        const message = await this.findMessageById.findMessageById(messageId);

        this.checkMessage(message, participant);

        message.editMessage(newContent);

        await this.messageRepo.update(message);

        await this.cacheService.delByPattern(`messages:${conversationId}:*`);

        const maxReadAt = await this.conversationRepo.getMaxReadAtForOthers(conversationId, actorId);

        return this.messageMapper.mapToMessage(message, maxReadAt);
    }
}