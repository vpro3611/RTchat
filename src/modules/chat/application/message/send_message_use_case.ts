import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MessageDTO} from "../../DTO/message_dto";
import {Message} from "../../domain/message/message";
import {Content} from "../../domain/message/content";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {UserIsNotAllowedToPerformError} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantListDTO} from "../../DTO/participant_list_dto";


export class SendMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly cacheService: CacheServiceInterface,
                private readonly participantRepo: ParticipantRepoInterface,
    ) {}

    private async invalidateCache(participants: ParticipantListDTO[]) {
        for (const p of participants) {
            await this.cacheService.delByPattern(`conv:user:${p.userId}:*`);
        }
    }

    async sendMessageUseCase(actorId: string, conversationId: string, content: string): Promise<MessageDTO> {
        const validatedContent = Content.create(content);
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        if (!participant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages");
        }

        const message = Message.create(
            conversationId,
            actorId,
            validatedContent,
        );

        await this.messageRepo.create(message);

        await this.conversationRepo.updateLastMessage(conversationId, message.getCreatedAt());

        // invalidate cache messages
        await this.cacheService.delByPattern(`messages:${conversationId}:*`);

        const participants = await this.participantRepo.getParticipants(conversationId);

        // invalidate user conversation list
        await this.invalidateCache(participants.items);

        return this.messageMapper.mapToMessage(message);
    }
}