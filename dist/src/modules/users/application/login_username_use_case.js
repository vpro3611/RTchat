"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUsernameUseCase = void 0;
const Username_1 = require("../domain/Username");
const password_1 = require("../domain/password");
const use_case_errors_1 = require("../errors/use_case_errors");
class LoginUsernameUseCase {
    userRepoReader;
    bcrypter;
    mapper;
    constructor(userRepoReader, bcrypter, mapper) {
        this.userRepoReader = userRepoReader;
        this.bcrypter = bcrypter;
        this.mapper = mapper;
    }
    async userExists(username) {
        const user = await this.userRepoReader.getUserByUsername(username);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError('User not found');
        }
        return user;
    }
    async passwordComparison(password, hash) {
        const comparePasswords = await this.bcrypter.compare(password, hash);
        if (!comparePasswords) {
            throw new use_case_errors_1.InvalidCredentialsError('Invalid credentials');
        }
    }
    async loginByUsernameUseCase(username, password) {
        const validUsername = Username_1.Username.create(username);
        const validPassword = password_1.Password.validatePlain(password);
        const user = await this.userExists(validUsername.getValue());
        user.canLogin();
        await this.passwordComparison(validPassword, user.getPassword().getHash());
        return this.mapper.mapToDto(user);
    }
}
exports.LoginUsernameUseCase = LoginUsernameUseCase;
