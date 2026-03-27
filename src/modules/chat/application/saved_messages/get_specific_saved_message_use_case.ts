import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {SavedMessagesRepoInterface} from "../../domain/ports/saved_messages_repo_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {MessageNotFoundError} from "../../errors/message_errors/message_errors";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";


export class GetSpecificSavedMessageUseCase {
    constructor(
        private readonly userRepoReader: UserRepoReader,
        private readonly savedMessageRepo: SavedMessagesRepoInterface,
        private readonly mapToSavedMessageDto: MapToSavedMessageDto,
        private readonly cacheService: CacheServiceInterface
    ) {}

    async getSpecificSavedMessageUseCase(actorId: string, messageId: string) {
        const user = await this.userRepoReader.getUserById(actorId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        user.ensureIsVerifiedAndActive();

        const cacheKey = `saved_messages:msg:${messageId}:user:${actorId}`;

        return await this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const res =  await this.savedMessageRepo.getSpecificSavedMessage(messageId, actorId);
                if (!res) {
                    throw new MessageNotFoundError("Message not found");
                }
                return this.mapToSavedMessageDto.mapToSavedMessageDto(res);
            }
        )
    }
}