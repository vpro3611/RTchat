import {User} from "../domain/user";
import {UserDTO} from "../DTO/user_dto";


export class UserMapper {
     mapToDto(user: User): UserDTO {
        return {
            id: user.id,
            username: user.getUsername().getValue(),
            email: user.getEmail().getValue(),
            isActive: user.getIsActive(),
            isVerified: user.getIsVerified(),
            lastSeenAt: user.getLastSeenAt()?.toISOString() ?? new Date().toISOString(),
            createdAt: user.getCreatedAt().toISOString(),
            updatedAt: user.getUpdatedAt().toISOString(),
        }
    }
}
