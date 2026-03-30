"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserAvatarUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
class DeleteUserAvatarUseCase {
    userReader;
    userWriter;
    avatarRepo;
    cacheService;
    constructor(userReader, userWriter, avatarRepo, cacheService) {
        this.userReader = userReader;
        this.userWriter = userWriter;
        this.avatarRepo = avatarRepo;
        this.cacheService = cacheService;
    }
    async ensureUserExists(userId) {
        const user = await this.userReader.getUserById(userId);
        if (!user)
            throw new use_case_errors_1.UserNotFoundError("User not found");
        user.ensureIsVerifiedAndActive();
        return user;
    }
    async execute(userId) {
        const user = await this.ensureUserExists(userId);
        user.ensureIsVerifiedAndActive();
        const avatarId = user.getAvatarId();
        if (!avatarId)
            return;
        await this.userWriter.updateAvatarId(userId, null);
        await this.avatarRepo.delete(avatarId);
        await this.cacheService.del(`user:${userId}`);
    }
}
exports.DeleteUserAvatarUseCase = DeleteUserAvatarUseCase;
