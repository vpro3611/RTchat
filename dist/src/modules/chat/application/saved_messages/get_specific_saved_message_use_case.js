"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificSavedMessageUseCase = void 0;
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
const message_errors_1 = require("../../errors/message_errors/message_errors");
class GetSpecificSavedMessageUseCase {
    userRepoReader;
    savedMessageRepo;
    mapToSavedMessageDto;
    cacheService;
    constructor(userRepoReader, savedMessageRepo, mapToSavedMessageDto, cacheService) {
        this.userRepoReader = userRepoReader;
        this.savedMessageRepo = savedMessageRepo;
        this.mapToSavedMessageDto = mapToSavedMessageDto;
        this.cacheService = cacheService;
    }
    async getSpecificSavedMessageUseCase(actorId, messageId) {
        const user = await this.userRepoReader.getUserById(actorId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError("User not found");
        }
        user.ensureIsVerifiedAndActive();
        const cacheKey = `saved_messages:msg:${messageId}:user:${actorId}`;
        return await this.cacheService.remember(cacheKey, 60, async () => {
            const res = await this.savedMessageRepo.getSpecificSavedMessage(messageId, actorId);
            if (!res) {
                throw new message_errors_1.MessageNotFoundError("Message not found");
            }
            return this.mapToSavedMessageDto.mapToSavedMessageDto(res);
        });
    }
}
exports.GetSpecificSavedMessageUseCase = GetSpecificSavedMessageUseCase;
