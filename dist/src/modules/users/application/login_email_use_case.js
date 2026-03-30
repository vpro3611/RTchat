"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginEmailUseCase = void 0;
const email_1 = require("../domain/email");
const password_1 = require("../domain/password");
const use_case_errors_1 = require("../errors/use_case_errors");
class LoginEmailUseCase {
    userRepoReader;
    bcrypter;
    mapper;
    constructor(userRepoReader, bcrypter, mapper) {
        this.userRepoReader = userRepoReader;
        this.bcrypter = bcrypter;
        this.mapper = mapper;
    }
    async userExists(email) {
        const user = await this.userRepoReader.getUserByEmail(email);
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
    async loginByEmailUseCase(email, password) {
        const emailValid = email_1.Email.create(email);
        const passwordValid = password_1.Password.validatePlain(password);
        const user = await this.userExists(emailValid.getValue());
        user.canLogin();
        await this.passwordComparison(passwordValid, user.getPassword().getHash());
        return this.mapper.mapToDto(user);
    }
}
exports.LoginEmailUseCase = LoginEmailUseCase;
