import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { UserRepoReader, UserRepoWriter } from "../../../users/ports/user_repo_interfaces";
import { Avatar } from "../../domain/avatar/avatar";
import { ImageProcessorInterface } from "../../domain/ports/image_processor_interface";
import { UserNotFoundError } from "../../../users/errors/use_case_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";

export class SetUserAvatarUseCase {
    constructor(
        private readonly userReader: UserRepoReader,
        private readonly userWriter: UserRepoWriter,
        private readonly avatarRepo: AvatarRepoInterface,
        private readonly imageProcessor: ImageProcessorInterface,
        private readonly cacheService: CacheServiceInterface
    ) {}

    private async invalidateUserCache(userId: string) {
        await this.cacheService.del(`user:${userId}`);
    }

    async execute(userId: string, fileBuffer: Buffer): Promise<string> {
        const user = await this.userReader.getUserById(userId);
        if (!user) throw new UserNotFoundError("User not found");
        user.ensureIsVerifiedAndActive();

        const oldAvatarId = user.getAvatarId();

        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);

        await this.userWriter.updateAvatarId(userId, newAvatarId);

        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }

        await this.invalidateUserCache(userId);

        return newAvatarId;
    }
}
