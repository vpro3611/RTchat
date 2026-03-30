"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleIsActiveUseCase = void 0;
class ToggleIsActiveUseCase {
    userRepoWriter;
    mapper;
    userLookup;
    constructor(userRepoWriter, mapper, userLookup) {
        this.userRepoWriter = userRepoWriter;
        this.mapper = mapper;
        this.userLookup = userLookup;
    }
    async toggleIsActiveUseCase(actorId) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerified();
        user.setIsActive();
        const saved = await this.userRepoWriter.save(user);
        return this.mapper.mapToDto(saved);
    }
}
exports.ToggleIsActiveUseCase = ToggleIsActiveUseCase;
