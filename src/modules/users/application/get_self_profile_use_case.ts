import {UserLookup} from "../shared/user_exists_by_id";
import {User} from "../domain/user";
import {UserDTO} from "../DTO/user_dto";


export class GetSelfProfileUseCase {
    constructor(private readonly userLookup: UserLookup) {}

    private mapToUser(user: User): UserDTO {
        return {
            id: user.id,
            username: user.getUsername().getValue(),
            email: user.getEmail().getValue(),
            isActive: user.getIsActive(),
            isVerified: user.getIsVerified(),
            avatarId: user.getAvatarId(),
            lastSeenAt: user.getLastSeenAt().toISOString(),
            createdAt: user.getCreatedAt().toISOString(),
            updatedAt: user.getUpdatedAt().toISOString(),
        }
    }

    async getSelfProfileUseCase(actorId: string) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        return this.mapToUser(user);
    }
}