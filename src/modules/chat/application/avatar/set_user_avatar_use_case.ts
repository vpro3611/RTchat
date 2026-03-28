import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { UserRepoReader, UserRepoWriter } from "../../../users/ports/user_repo_interfaces";
import { Avatar } from "../../domain/avatar/avatar";
import { ImageProcessor } from "../../infrasctructure/image_processor/sharp_image_processor";

export class SetUserAvatarUseCase {
    constructor(
        private readonly userReader: UserRepoReader,
        private readonly userWriter: UserRepoWriter,
        private readonly avatarRepo: AvatarRepoInterface,
        private readonly imageProcessor: ImageProcessor
    ) {}

    async execute(userId: string, fileBuffer: Buffer): Promise<string> {
        const user = await this.userReader.getUserById(userId);
        if (!user) throw new Error("User not found");

        const oldAvatarId = user.getAvatarId();

        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);

        await this.userWriter.updateAvatarId(userId, newAvatarId);

        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }

        return newAvatarId;
    }
}
