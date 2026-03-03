import {User} from "../domain/user";
import {UserDTO} from "../infrastructure/user_dto";

export function SHAREDmapToDto(user: User): UserDTO
{
    return {
        id: user.id,
        username: user.getUsername().getValue(),
        email: user.getEmail().getValue(),
        isActive: user.getIsActive(),
        lastSeenAt: user.getLastSeenAt().toISOString(),
        createdAt: user.getCreatedAt().toISOString(),
        updated_at: user.getUpdatedAt().toISOString(),
    }
}