"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveSavedMessageUseCase = void 0;
const message_errors_1 = require("../../errors/message_errors/message_errors");
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
class RemoveSavedMessageUseCase {
    userRepoReader;
    savedMessageRepo;
    cacheService;
    constructor(userRepoReader, savedMessageRepo, cacheService) {
        this.userRepoReader = userRepoReader;
        this.savedMessageRepo = savedMessageRepo;
        this.cacheService = cacheService;
    }
    async ensureUserExists(userId) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError("User not found");
        }
        return user;
    }
    async ensureSavedMessageExists(messageId, userId) {
        const savedMessage = await this.savedMessageRepo.isSaved(messageId, userId);
        if (!savedMessage) {
            throw new message_errors_1.MessageNotFoundError("This message is not saved");
        }
    }
    async removeSavedMessageUseCase(actorId, messageId) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();
        await this.ensureSavedMessageExists(messageId, actorId);
        await this.savedMessageRepo.removeSavedMessage(messageId, actorId);
        await Promise.all([
            this.cacheService.delByPattern(`saved_messages:list:user:${actorId}:*`),
            this.cacheService.del(`saved_messages:msg:${messageId}:user:${actorId}`)
        ]);
    }
}
exports.RemoveSavedMessageUseCase = RemoveSavedMessageUseCase;
