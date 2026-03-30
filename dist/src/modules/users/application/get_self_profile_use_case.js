"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSelfProfileUseCase = void 0;
class GetSelfProfileUseCase {
    userLookup;
    constructor(userLookup) {
        this.userLookup = userLookup;
    }
    mapToUser(user) {
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
        };
    }
    async getSelfProfileUseCase(actorId) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        return this.mapToUser(user);
    }
}
exports.GetSelfProfileUseCase = GetSelfProfileUseCase;
