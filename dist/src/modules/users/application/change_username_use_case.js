"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeUsernameUseCase = void 0;
const Username_1 = require("../domain/Username");
const username_errors_1 = require("../errors/username_errors");
const user_database_error_1 = require("../errors/user_database_error");
class ChangeUsernameUseCase {
    userRepoReader;
    userRepoWriter;
    mapper;
    userLookup;
    constructor(userRepoReader, userRepoWriter, mapper, userLookup) {
        this.userRepoReader = userRepoReader;
        this.userRepoWriter = userRepoWriter;
        this.mapper = mapper;
        this.userLookup = userLookup;
    }
    async checkUserWithSameUsername(username) {
        const user = await this.userRepoReader.getUserByUsername(username);
        if (user) {
            throw new username_errors_1.UsernameAlreadyExistsError(`Username: ${username} already exists`);
        }
    }
    async changeUsernameUseCase(actorId, newUsername) {
        try {
            const usernameValid = Username_1.Username.create(newUsername);
            const user = await this.userLookup.getUserOrThrow(actorId);
            await this.checkUserWithSameUsername(usernameValid.getValue());
            user.setUsername(usernameValid);
            const saved = await this.userRepoWriter.save(user);
            return this.mapper.mapToDto(saved);
        }
        catch (error) {
            if (error instanceof user_database_error_1.UsernameAlreadyExistDatabaseError) {
                throw new username_errors_1.UsernameAlreadyExistsError(`Your chosen username already exists!`);
            }
            throw error;
        }
    }
}
exports.ChangeUsernameUseCase = ChangeUsernameUseCase;
