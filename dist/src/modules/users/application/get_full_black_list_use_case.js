"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFullBlackListUseCase = void 0;
class GetFullBlackListUseCase {
    userToUserBlocksInterface;
    userLookup;
    userMapper;
    constructor(userToUserBlocksInterface, userLookup, userMapper) {
        this.userToUserBlocksInterface = userToUserBlocksInterface;
        this.userLookup = userLookup;
        this.userMapper = userMapper;
    }
    async getFullBlackListUseCase(actorId) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();
        const blackList = await this.userToUserBlocksInterface.getFullBlacklist(actorId);
        return blackList.map(blockedUser => this.userMapper.mapToDto(blockedUser));
    }
}
exports.GetFullBlackListUseCase = GetFullBlackListUseCase;
