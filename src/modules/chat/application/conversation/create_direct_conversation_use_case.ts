import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {Conversation} from "../../domain/conversation/conversation";
import {Participant} from "../../domain/participant/participant";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {ConversationDTO} from "../../DTO/conversation_dto";
import {CannotCreateConversationError} from "../../errors/conversation_errors/conversation_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {UserToUserBlocksInterface} from "../../../users/ports/user_to_user_blocks_interface";


export class CreateDirectConversationUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationMapper: MapToConversationDto,
                private readonly cacheService: CacheServiceInterface,
                private readonly userToUserBansRepo: UserToUserBlocksInterface,
    ) {}

    private checkForSelf(actorId: string, targetId: string) {
        if (actorId === targetId) {
            throw new CannotCreateConversationError("Cannot create a conversation with yourself");
        }
    }

    private async invalidateUserConversationsCache(...userIds: string[]) {
        for (const id of userIds) {
            await this.cacheService.delByPattern(`conv:user:${id}:*`);
        }
    }

    private async checkForBlockingRelations(actorId: string, targetId: string) {
        const relation = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (relation) {
            throw new CannotCreateConversationError("Cannot create a conversation with a blocked user");
        }
    }

    async createDirectConversationUseCase(actorId: string, targetId: string): Promise<ConversationDTO> {

        this.checkForSelf(actorId, targetId);

        await this.checkForBlockingRelations(actorId, targetId);

        const existingConversation = await this.conversationRepo.findDirectConversation(actorId, targetId);
        if (existingConversation) {
            return this.conversationMapper.mapToConversationDto(existingConversation);
        }

        const conversation = Conversation.createDirect(
            actorId,
            actorId,
            targetId
        );

        await this.conversationRepo.create(conversation);

        const participantA = Participant.createAsMember(
            conversation.id,
            actorId
        );

        const participantB = Participant.createAsMember(
            conversation.id,
            targetId
        )

        await this.participantRepo.save(participantA);
        await this.participantRepo.save(participantB);

        // cache invalidation
        await this.invalidateUserConversationsCache(actorId, targetId);

        return this.conversationMapper.mapToConversationDto(conversation);
    }
}