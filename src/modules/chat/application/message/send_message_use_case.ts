import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MessageDTO} from "../../DTO/message_dto";
import {Message} from "../../domain/message/message";
import {Content} from "../../domain/message/content";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {
    UserIsNotAllowedToPerformError,
    UserIsNotParticipantError
} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantListDTO} from "../../DTO/participant_list_dto";
import {CannotCreateConversationError} from "../../errors/conversation_errors/conversation_errors";
import {UserToUserBlocksInterface} from "../../../users/ports/user_to_user_blocks_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";


export class SendMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly cacheService: CacheServiceInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly userToUserBansRepo: UserToUserBlocksInterface,
                private readonly conversationBansRepo: ConversationBansInterface,
    ) {}

    private async checkIfUserIsBannedFromGroup(actorId: string, conversationId: string) {
        const relation = await this.conversationBansRepo.isBanned(conversationId, actorId);
        if (relation) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages because of being blocked by the target user");
        }
    }

    private async invalidateCache(participants: ParticipantListDTO[]) {
        for (const p of participants) {
            await this.cacheService.delByPattern(`conv:user:${p.userId}:*`);
        }
    }

    private async checkForBlockingRelations(actorId: string, targetId: string) {
        const relation = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (relation) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages because of being blocked by the target user");
        }
    }

    private async getConversation(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new CannotCreateConversationError("Conversation not found");
        }
        return conversation;
    }

    async sendMessageUseCase(actorId: string, conversationId: string, content: string): Promise<MessageDTO> {
        const validatedContent = Content.create(content);
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        if (!participant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages");
        }

        const conversation = await this.getConversation(conversationId);

        if (conversation.getConversationType() === "direct") {
            const participants = await this.participantRepo.getParticipants(conversationId);
            const target = participants.items.find(p => p.userId !== actorId);
            if (!target) {
                throw new UserIsNotParticipantError("User is not a participant of the conversation." +
                    " Cannot send message to a direct conversation without a target user");
            }
            await this.checkForBlockingRelations(actorId, target.userId);
        }

        if (conversation.getConversationType() === "group") {
            await this.checkIfUserIsBannedFromGroup(actorId, conversationId);
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

        return this.messageMapper.mapToMessage(message, null);
    }
}