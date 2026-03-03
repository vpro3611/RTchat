import {User} from "../domain/user";
import {UserDTO} from "../DTO/user_dto";


export class UserMapper {
    async mapToDto(user: User): Promise<UserDTO> {
        return {
            id: user.id,
            username: user.getUsername().getValue(),
            email: user.getEmail().getValue(),
            isActive: user.getIsActive(),
            isVerified: user.getIsVerified(),
            lastSeenAt: user.getLastSeenAt().toISOString(),
            createdAt: user.getCreatedAt().toISOString(),
            updated_at: user.getUpdatedAt().toISOString(),
        }
    }
}
