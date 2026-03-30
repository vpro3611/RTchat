"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockSpecificUserUseCase = void 0;
const use_case_errors_1 = require("../errors/use_case_errors");
class UnblockSpecificUserUseCase {
    userToUserBlocksRepo;
    userRepoReader;
    userMapper;
    constructor(userToUserBlocksRepo, userRepoReader, userMapper) {
        this.userToUserBlocksRepo = userToUserBlocksRepo;
        this.userRepoReader = userRepoReader;
        this.userMapper = userMapper;
    }
    checkForSelf(actorId, targetId) {
        if (actorId === targetId) {
            throw new use_case_errors_1.CannotBlockYourselfError('You cannot block yourself');
        }
    }
    async checkActor(actorId) {
        const actor = await this.userRepoReader.getUserById(actorId);
        if (!actor) {
            throw new use_case_errors_1.UserNotFoundError('User not found');
        }
        return actor;
    }
    async relationExists(actorId, targetId) {
        const relation = await this.userToUserBlocksRepo.ensureBlockedExists(actorId, targetId);
        return relation;
    }
    checkRelation(relation) {
        if (!relation) {
            throw new use_case_errors_1.UnblockUserError("Failed to unblock user, user not blocked by you");
        }
    }
    async unblockSpecificUserUseCase(actorId, targetId) {
        this.checkForSelf(actorId, targetId);
        const actor = await this.checkActor(actorId);
        actor.ensureIsVerifiedAndActive();
        const relation = await this.relationExists(actorId, targetId);
        this.checkRelation(relation);
        const result = await this.userToUserBlocksRepo.unblockSpecificUser(actorId, targetId);
        return this.userMapper.mapToDto(result);
    }
}
exports.UnblockSpecificUserUseCase = UnblockSpecificUserUseCase;
