import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {ConversationNotFoundError} from "../../errors/conversation_errors/conversation_errors";
import {
    ConversationRequestNotCreatedError
} from "../../errors/conversation_requests_errors/conversation_requests_errors";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {ConversationRequests} from "../../domain/conversation_requests/conversation_requests";
import {Conversation} from "../../domain/conversation/conversation";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class CreateConversationRequestUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly conversationRepoBans: ConversationBansInterface,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly conversationRequestsMapper: MapToRequestDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async ensureUserExists(userId: string) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }

    private async ensureConversationExists(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }

    private ensureIsGroup(conversation: Conversation) {
        if (conversation.getConversationType() !== "group") {
            throw new ConversationRequestNotCreatedError("Cannot create a conversation request for a direct conversation");
        }
    }

    private async ensureUserIsNotAlreadyParticipant(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, userId);
        if (participant) {
            throw new ConversationRequestNotCreatedError("User is already a member of the conversation");
        }
    }

    private async ensureNoBannedRelationsExists(conversationId: string, userId: string) {
        const banned = await this.conversationRepoBans.isBanned(conversationId, userId);
        if (banned) {
            throw new ConversationRequestNotCreatedError("User is banned from the conversation; could not send a request");
        }
    }

    private async invalidateCaches(conversationId: string, userId: string) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
        ]);
    }

    async createConversationRequestUseCase(actorId: string, conversationId: string, requestMessage: string) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        const conversation = await this.ensureConversationExists(conversationId);
        this.ensureIsGroup(conversation);

        await this.ensureUserIsNotAlreadyParticipant(conversationId, actorId);

        await this.ensureNoBannedRelationsExists(conversationId, actorId);

        const newRequest = ConversationRequests.create(
            conversationId,
            actorId,
            requestMessage,
        );

        await this.conversationRequestsRepo.create(newRequest);

        await this.invalidateCaches(conversationId, actorId);

        return this.conversationRequestsMapper.mapToRequestDto(newRequest);
    }
}