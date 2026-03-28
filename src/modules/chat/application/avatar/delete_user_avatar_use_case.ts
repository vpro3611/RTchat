import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { UserRepoReader, UserRepoWriter } from "../../../users/ports/user_repo_interfaces";
import { UserNotFoundError } from "../../../users/errors/use_case_errors";

export class DeleteUserAvatarUseCase {
    constructor(
        private readonly userReader: UserRepoReader,
        private readonly userWriter: UserRepoWriter,
        private readonly avatarRepo: AvatarRepoInterface
    ) {}

    async execute(userId: string): Promise<void> {
        const user = await this.userReader.getUserById(userId);
        if (!user) throw new UserNotFoundError("User not found");

        const avatarId = user.getAvatarId();
        if (!avatarId) return;

        await this.userWriter.updateAvatarId(userId, null);
        await this.avatarRepo.delete(avatarId);
    }
}
