import {SavedMessagesRepoInterface} from "../../domain/ports/saved_messages_repo_interface";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {MessageNotFoundError} from "../../errors/message_errors/message_errors";
import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";


export class RemoveSavedMessageUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly savedMessageRepo: SavedMessagesRepoInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async ensureUserExists(userId: string) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }

    private async ensureSavedMessageExists(messageId: string, userId: string) {
        const savedMessage = await this.savedMessageRepo.isSaved(messageId, userId);
        if (!savedMessage) {
            throw new MessageNotFoundError("This message is not saved");
        }
    }


    async removeSavedMessageUseCase(actorId: string, messageId: string) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        await this.ensureSavedMessageExists(messageId, actorId);

        await this.savedMessageRepo.removeSavedMessage(messageId, actorId);

        await Promise.all([
            this.cacheService.delByPattern(`saved_messages:list:user:${actorId}:*`),
            this.cacheService.del(`saved_messages:msg:${messageId}:user:${actorId}`)
        ]);
    }
}