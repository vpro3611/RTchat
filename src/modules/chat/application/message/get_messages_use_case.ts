import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";


export class GetMessagesUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly cacheService: CacheServiceInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
    ) {}

    private async actorIsParticipant(actorId: string, conversationId: string) {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation")
        }
    }

    async getMessagesUseCase(actorId: string, conversationId: string, limit?: number, cursor?: string) {
        const cacheKey = `messages:${conversationId}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;

        await this.actorIsParticipant(actorId, conversationId);

        const maxReadAt = await this.conversationRepo.getMaxReadAtForOthers(conversationId, actorId);

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.messageRepo.findByConversationId(conversationId, limit, cursor);
                return {
                    items: result.items.map(message => this.messageMapper.mapToMessage(message, maxReadAt)),
                    nextCursor: result.nextCursor,
                }
            }
        )
    }
}