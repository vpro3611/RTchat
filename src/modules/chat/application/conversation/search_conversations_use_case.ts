import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {UserLookup} from "../../../users/shared/user_exists_by_id";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";


export class SearchConversationUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly userLookup: UserLookup,
                private readonly conversationMapper: MapToConversationDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    async searchConversationUseCase(actorId: string, query: string, limit?: number, cursor?: string) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();

        const cacheKey = `search:conv:query:${query}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.conversationRepo.searchConversations(query, limit, cursor);
                return {
                    items: result.items.map(conversation => this.conversationMapper.mapToConversationDto(conversation)),
                    nextCursor: result.nextCursor,
                };
            }
        );
    }
}