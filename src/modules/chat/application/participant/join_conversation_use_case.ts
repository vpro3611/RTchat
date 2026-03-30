import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationNotFoundError} from "../../errors/conversation_errors/conversation_errors";
import {
    CannotJoinDirectConversationError,
    UserAlreadyParticipantError, UserIsNotAllowedToPerformError
} from "../../errors/participants_errors/participant_errors";
import {Conversation} from "../../domain/conversation/conversation";
import {ConversationType} from "../../domain/conversation/conversation_type";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {ConversationRequests} from "../../domain/conversation_requests/conversation_requests";
import {ConversationRequestsDto} from "../../DTO/conversation_requests_dto";

export class JoinConversationUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly cacheService: CacheServiceInterface,
                private readonly conversationBansRepo: ConversationBansInterface,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly requestMapper: MapToRequestDto,
    ) {}

    private async checkIfIsBanned(actorId: string, conversationId: string) {
        const exists = await this.conversationBansRepo.isBanned(conversationId, actorId);
        if (exists) {
            throw new UserIsNotAllowedToPerformError("User is banned from the conversation");
        }
    }

    private async checkIfConversationExists(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }

    private async checkIfUserExists(conversationId: string, userId: string) {
        const exists = await this.participantRepo.exists(conversationId, userId);

        if (exists) {
            throw new UserAlreadyParticipantError("User already joined the conversation");
        }
    }

    private checkForGroupConversation(conversation: Conversation) {
        if (conversation.getConversationType() === ConversationType.DIRECT) {
            throw new CannotJoinDirectConversationError("Cannot join a direct conversation | Seek for groups to join");
        }
    }

    private async invalidateRequestCaches(conversationId: string, userId: string) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
        ]);
    }

    async joinConversationUseCase(actorId: string, conversationId: string): Promise<ConversationRequestsDto> {
        const conversation = await this.checkIfConversationExists(conversationId);

        await this.checkIfIsBanned(actorId, conversationId);

        this.checkForGroupConversation(conversation);

        await this.checkIfUserExists(conversationId, actorId);

        const newRequest = ConversationRequests.create(
            conversationId,
            actorId,
            "User requested to join the conversation via Join button"
        );

        await this.conversationRequestsRepo.create(newRequest);

        await this.invalidateRequestCaches(conversationId, actorId);

        return this.requestMapper.mapToRequestDto(newRequest);
    }
}