import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class GetUserConversationsUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly conversationMapper: MapToConversationDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    async getUserConversationsUseCase (actorId: string, limit?: number, cursor?: string) {
        const cacheKey = `conv:user:${actorId}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;
        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.conversationRepo.getUserConversations(actorId, limit, cursor);
                return {
                    items: result.items.map(conversation => this.conversationMapper.mapToConversationDto(conversation)),
                    nextCursor: result.nextCursor,
                };
            }
        );
    }
}