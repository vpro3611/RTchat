import {UserRepoReader} from "../ports/user_repo_interfaces";
import {UserLookup} from "../shared/user_exists_by_id";
import {UserMapper} from "../shared/map_to_dto";
import {CacheService} from "../../infrasctructure/ports/cache_service/cache_service";


export class SearchUsersUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userLookup: UserLookup,
                private readonly userMapper: UserMapper,
                private readonly cacheService: CacheService
    ) {}

    async searchUsersUseCase(actorId: string, query: string, limit?: number, cursor?: string) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();

        const cacheKey = `users:search:${query}:${limit}:${cursor}`;

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const users = await this.userRepoReader.searchUsers(query, limit, cursor);
                return {
                    items: await Promise.all(users.items.map(user => this.userMapper.mapToDto(user))),
                    nextCursor: users.nextCursor,
                };
            }
        );
    }
}