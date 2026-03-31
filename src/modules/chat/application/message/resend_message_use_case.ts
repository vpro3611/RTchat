import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MessageDTO} from "../../DTO/message_dto";
import {Message} from "../../domain/message/message";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {FindMessageById} from "../../shared/find_message_by_id";
import {
    UserIsNotAllowedToPerformError
} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantListDTO} from "../../DTO/participant_list_dto";
import {CannotCreateConversationError} from "../../errors/conversation_errors/conversation_errors";
import {UserToUserBlocksInterface} from "../../../users/ports/user_to_user_blocks_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {MessageNotAPartOfConversationError} from "../../errors/message_errors/message_errors";
import {ValidationError} from "../../../../http_errors_base";


export class ResendMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly findMessageById: FindMessageById,
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

    async resendMessageUseCase(
        actorId: string, 
        messageId: string, 
        sourceConversationId: string, 
        targetConversationId: string
    ): Promise<MessageDTO> {
        // 1. Validate Source
        await this.checkIsParticipant.checkIsParticipant(actorId, sourceConversationId);

        const originalMessage = await this.findMessageById.findMessageById(messageId);
        
        if (originalMessage.getConversationId() !== sourceConversationId) {
            throw new MessageNotAPartOfConversationError("Message does not belong to the source conversation");
        }

        if (originalMessage.getIsDeleted()) {
            throw new ValidationError("Cannot resend a deleted message");
        }

        // 2. Validate Target Permissions
        const targetParticipant = await this.checkIsParticipant.checkIsParticipant(actorId, targetConversationId);
        if (!targetParticipant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages in the target conversation");
        }

        const targetConversation = await this.getConversation(targetConversationId);

        if (targetConversation.getConversationType() === "direct") {
            const participants = await this.participantRepo.getParticipants(targetConversationId);
            const target = participants.items.find(p => p.userId !== actorId);
            if (!target) {
                throw new UserIsNotAllowedToPerformError("Cannot send message to a direct conversation without a target user");
            }
            await this.checkForBlockingRelations(actorId, target.userId);
        }

        if (targetConversation.getConversationType() === "group") {
            await this.checkIfUserIsBannedFromGroup(actorId, targetConversationId);
        }

        // 3. Create Resent Message
        const trueOriginalSenderId = originalMessage.getOriginalSenderId() || originalMessage.getSenderId();
        
        const message = Message.createResent(
            targetConversationId,
            actorId,
            originalMessage.getContent(),
            trueOriginalSenderId
        );

        await this.messageRepo.create(message);

        await this.conversationRepo.updateLastMessage(targetConversationId, message.getCreatedAt());

        // 4. Cache Invalidation
        await this.cacheService.delByPattern(`messages:${targetConversationId}:*`);
        const targetParticipants = await this.participantRepo.getParticipants(targetConversationId);
        await this.invalidateCache(targetParticipants.items);

        const maxReadAt = await this.conversationRepo.getMaxReadAtForOthers(targetConversationId, actorId);

        return this.messageMapper.mapToMessage(message, maxReadAt);
    }
}
