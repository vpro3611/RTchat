import {UserRepoWriter} from "../ports/user_repo_interfaces";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {CacheServiceInterface} from "../../infrasctructure/ports/cache_service/cache_service_interface";


export class ToggleIsActiveUseCase {
    constructor(
                private readonly userRepoWriter: UserRepoWriter,
                private readonly mapper: UserMapper,
                private readonly userLookup: UserLookup,
                private readonly cacheService: CacheServiceInterface
    ) {}



    async toggleIsActiveUseCase(actorId: string) {
        const user = await this.userLookup.getUserOrThrow(actorId);

        user.ensureIsVerifiedAndActive();

        user.setIsActiveTo(false);

        const saved = await this.userRepoWriter.save(user);

        // Invalidate search cache
        await this.cacheService.delByPattern("users:search:*");

        return this.mapper.mapToDto(saved);
    }
}