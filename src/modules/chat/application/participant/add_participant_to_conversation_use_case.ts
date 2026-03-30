import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {UserToUserBlocksInterface} from "../../../users/ports/user_to_user_blocks_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {Participant} from "../../domain/participant/participant";
import {ParticipantDTO} from "../../DTO/participant_dto";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError, UserIsNotAllowedToPerformError
} from "../../errors/participants_errors/participant_errors";
import {ConversationNotFoundError} from "../../errors/conversation_errors/conversation_errors";
import {Conversation} from "../../domain/conversation/conversation";
import {ConflictError} from "../../../../http_errors_base";


export class AddParticipantToConversationUseCase {
    constructor(private readonly userRepo: UserRepoReaderPg,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationBansRepo: ConversationBansInterface,
                private readonly participantMapper: MapToParticipantDto,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly userToUserBansRepo: UserToUserBlocksInterface,
                private readonly cacheService: CacheServiceInterface,
    ) {}
    // ADD CACHE

    private async ensureUserExists(userId: string) {
        const user = await this.userRepo.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }

    private async ensureActorIsParticipant(conversationId: string, actorId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new ActorIsNotParticipantError("Actor is not a participant of the conversation");
        }
        return participant;
    }

    private ensureIsOwner(actor: Participant) {
        if (actor.getRole() !== "owner") {
            throw new InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }

    private async checkUserToUserRelations(actorId: string, targetId: string) {
        const userToUserBlocks = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (userToUserBlocks) {
            throw new UserIsNotAllowedToPerformError("User is blocked by the target user");
        }
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
            throw new ConflictError("Cannot add a participant to a direct conversation");
        }
    }

    private async checkConversationBans(targetId: string, conversationId: string) {
        const conversationBans = await this.conversationBansRepo.isBanned(conversationId, targetId);
        if (conversationBans) {
            throw new ConflictError("User is banned from the conversation");
        }
    }

    private async ensureTargetIsNotAlreadyParticipant(conversationId: string, targetId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, targetId);
        if (participant) {
            throw new ConflictError("User is already a participant of the conversation");
        }
    }

    private async invalidateCaches(conversationId: string, userId: string) {
        await Promise.all([
            this.cacheService.delByPattern(`participants:conv:${conversationId}:*`),
            this.cacheService.delByPattern(`conv:user:${userId}:*`),
        ]);
    }

    async addParticipantToConversationUseCase(actorId: string, targetId: string, conversationId: string): Promise<ParticipantDTO> {
        const user = await this.ensureUserExists(targetId);
        user.ensureIsVerifiedAndActive();

        const actor = await this.ensureActorIsParticipant(conversationId, actorId);
        this.ensureIsOwner(actor);

        await this.checkUserToUserRelations(actorId, targetId);

        const conversation = await this.ensureConversationExists(conversationId);
        this.ensureIsGroup(conversation);

        await this.checkConversationBans(targetId, conversationId);

        await this.ensureTargetIsNotAlreadyParticipant(conversationId, targetId);

        const newParticipant = Participant.createAsMember(
            conversationId,
            targetId,
        );

        await this.participantRepo.save(newParticipant);

        await this.invalidateCaches(conversationId, targetId);

        return this.participantMapper.mapToParticipantDto(newParticipant);
    }
}