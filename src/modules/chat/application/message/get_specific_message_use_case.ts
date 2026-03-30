import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {MapToMessage} from "../../shared/map_to_message";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {FindMessageById} from "../../shared/find_message_by_id";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {MessageNotAPartOfConversationError, MessageNotFoundError} from "../../errors/message_errors/message_errors";


export class GetSpecificMessageUseCase {
    constructor(
                private readonly messageMapper: MapToMessage,
                private readonly findMessageById: FindMessageById,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private actorExists = async (conversationId: string, actorId: string) => {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }

    async getSpecificMessageUseCase(actorId: string, conversationId: string, messageId: string) {
        const cacheKey = `message:conv:${conversationId}:id:${messageId}`;

        await this.actorExists(conversationId, actorId);

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const message = await this.findMessageById.findMessageById(messageId);

                if (message.getConversationId() !== conversationId) {
                    throw new MessageNotAPartOfConversationError("Message not found in the given conversation context")
                }
                return this.messageMapper.mapToMessage(message);
            }
        )
    }
}