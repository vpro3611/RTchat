"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSpecificUserUseCase = void 0;
const use_case_errors_1 = require("../errors/use_case_errors");
class BlockSpecificUserUseCase {
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
    async relationExists(actorId, targetId) {
        const relation = await this.userToUserBlocksRepo.ensureBlockedExists(actorId, targetId);
        return relation;
    }
    async checkActor(actorId) {
        const actor = await this.userRepoReader.getUserById(actorId);
        if (!actor) {
            throw new use_case_errors_1.UserNotFoundError('User not found');
        }
        return actor;
    }
    checkRelation(relation) {
        if (relation) {
            throw new use_case_errors_1.BlockUserError("Failed to block user, user already blocked by you");
        }
    }
    async blockSpecificUserUseCase(actorId, targetId) {
        this.checkForSelf(actorId, targetId);
        const actor = await this.checkActor(actorId);
        actor.ensureIsVerifiedAndActive();
        const relation = await this.relationExists(actorId, targetId);
        this.checkRelation(relation);
        const result = await this.userToUserBlocksRepo.blockSpecificUser(actorId, targetId);
        return this.userMapper.mapToDto(result);
    }
}
exports.BlockSpecificUserUseCase = BlockSpecificUserUseCase;
