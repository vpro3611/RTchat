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


export class DeleteMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly findMessageById: FindMessageById,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private checkMessage(message: Message, participant: Participant) {
        if (message.getSenderId() !== participant.userId) {
            throw new UserIsNotAnAuthorError("User is not the author of the message");
        }
        if (message.getConversationId() !== participant.getConversationId()) {
            throw new MessageNotAPartOfConversationError("This message is not part of the conversation");
        }
    }

    private checkIfCanDeleteMessages(participant: Participant) {
        if (!participant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to delete message");
        }
    }

    async deleteMessageUseCase(actorId: string, conversationId: string, messageId: string): Promise<MessageDTO> {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        this.checkIfCanDeleteMessages(participant);

        const message = await this.findMessageById.findMessageById(messageId);

        this.checkMessage(message, participant);

        message.deleteMessage();

        await this.messageRepo.update(message);

        await this.cacheService.delByPattern(`messages:${conversationId}:*`);

        return this.messageMapper.mapToMessage(message);
    }
}