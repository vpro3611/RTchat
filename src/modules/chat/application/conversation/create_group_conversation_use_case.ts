import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {Conversation} from "../../domain/conversation/conversation";
import {ConversationTitle} from "../../domain/conversation/conversation_title";
import {Participant} from "../../domain/participant/participant";
import {ConversationDTO} from "../../DTO/conversation_dto";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class CreateGroupConversationUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationMapper: MapToConversationDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    async createGroupConversationUseCase(title: string, actorId: string): Promise<ConversationDTO> {
        const validTitle = ConversationTitle.create(title);

        const conversation = Conversation.createGroup(validTitle, actorId);

        await this.conversationRepo.create(conversation);

        const owner = Participant.createAsOwner(conversation.id, actorId);

        await this.participantRepo.save(owner);
        
        await this.cacheService.delByPattern(`conv:user:${actorId}:*`);

        return this.conversationMapper.mapToConversationDto(conversation);
    }
}