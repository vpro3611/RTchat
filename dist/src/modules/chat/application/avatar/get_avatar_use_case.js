"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAvatarUseCase = void 0;
class GetAvatarUseCase {
    avatarRepo;
    constructor(avatarRepo) {
        this.avatarRepo = avatarRepo;
    }
    async execute(avatarId) {
        return await this.avatarRepo.findById(avatarId);
    }
}
exports.GetAvatarUseCase = GetAvatarUseCase;
