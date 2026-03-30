import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {SavedMessagesRepoInterface} from "../../domain/ports/saved_messages_repo_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";


export class GetSavedMessagesListUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly savedMessageRepo: SavedMessagesRepoInterface,
                private readonly mapToSavedMessageDto: MapToSavedMessageDto,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async ensureUserExists(userId: string) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }


    async getSavedMessagesListUseCase(actorId: string, limit?: number, cursor?: string) {
        const safeLimit = Math.min(limit ?? 20, 50);

        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        const cacheKey = `saved_messages:list:user:${actorId}:limit:${safeLimit}:cursor:${cursor ?? "none"}`;

        return await this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const res = await this.savedMessageRepo.getSavedMessages(actorId, safeLimit, cursor);
                return {
                    items: res.items.map(m => this.mapToSavedMessageDto.mapToSavedMessageDto(m)),
                    nextCursor: res.nextCursor,
                }
            }
        )
    }
}