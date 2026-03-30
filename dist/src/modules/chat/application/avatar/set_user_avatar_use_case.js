"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUserAvatarUseCase = void 0;
const avatar_1 = require("../../domain/avatar/avatar");
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
class SetUserAvatarUseCase {
    userReader;
    userWriter;
    avatarRepo;
    imageProcessor;
    cacheService;
    constructor(userReader, userWriter, avatarRepo, imageProcessor, cacheService) {
        this.userReader = userReader;
        this.userWriter = userWriter;
        this.avatarRepo = avatarRepo;
        this.imageProcessor = imageProcessor;
        this.cacheService = cacheService;
    }
    async invalidateUserCache(userId) {
        await this.cacheService.del(`user:${userId}`);
    }
    async execute(userId, fileBuffer) {
        const user = await this.userReader.getUserById(userId);
        if (!user)
            throw new use_case_errors_1.UserNotFoundError("User not found");
        user.ensureIsVerifiedAndActive();
        const oldAvatarId = user.getAvatarId();
        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = avatar_1.Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);
        await this.userWriter.updateAvatarId(userId, newAvatarId);
        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }
        await this.invalidateUserCache(userId);
        return newAvatarId;
    }
}
exports.SetUserAvatarUseCase = SetUserAvatarUseCase;
