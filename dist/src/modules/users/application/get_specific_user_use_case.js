"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificUserUseCase = void 0;
class GetSpecificUserUseCase {
    userLookup;
    userMapper;
    constructor(userLookup, userMapper) {
        this.userLookup = userLookup;
        this.userMapper = userMapper;
    }
    async getSpecificUserUseCase(actorId, targetId) {
        const actor = await this.userLookup.getUserOrThrow(actorId);
        actor.ensureIsVerifiedAndActive();
        const target = await this.userLookup.getUserOrThrow(targetId);
        target.ensureIsVerifiedAndActive();
        return this.userMapper.mapToDto(target);
    }
}
exports.GetSpecificUserUseCase = GetSpecificUserUseCase;
