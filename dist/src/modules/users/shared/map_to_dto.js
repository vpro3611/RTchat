"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    mapToDto(user) {
        return {
            id: user.id,
            username: user.getUsername().getValue(),
            email: user.getEmail().getValue(),
            isActive: user.getIsActive(),
            isVerified: user.getIsVerified(),
            avatarId: user.getAvatarId(),
            lastSeenAt: user.getLastSeenAt()?.toISOString() ?? new Date().toISOString(),
            createdAt: user.getCreatedAt().toISOString(),
            updatedAt: user.getUpdatedAt().toISOString(),
        };
    }
}
exports.UserMapper = UserMapper;
