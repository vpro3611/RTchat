import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { Avatar } from "../../domain/avatar/avatar";

export class GetAvatarUseCase {
    constructor(private readonly avatarRepo: AvatarRepoInterface) {}

    async execute(avatarId: string): Promise<Avatar | null> {
        return await this.avatarRepo.findById(avatarId);
    }
}
