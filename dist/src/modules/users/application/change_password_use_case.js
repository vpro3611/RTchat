"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const password_1 = require("../domain/password");
const use_case_errors_1 = require("../errors/use_case_errors");
class ChangePasswordUseCase {
    userRepoReader;
    userRepoWriter;
    bcrypter;
    mapper;
    userLookup;
    constructor(userRepoReader, userRepoWriter, bcrypter, mapper, userLookup) {
        this.userRepoReader = userRepoReader;
        this.userRepoWriter = userRepoWriter;
        this.bcrypter = bcrypter;
        this.mapper = mapper;
        this.userLookup = userLookup;
    }
    checkPasswordDifference(oldPassword, newPassword) {
        if (oldPassword === newPassword) {
            throw new use_case_errors_1.OldPasswordNotMatchError('Old password and new password must be different');
        }
    }
    async comparePasswords(oldPassword, currentPassword) {
        const comparePasswords = await this.bcrypter.compare(oldPassword, currentPassword);
        if (!comparePasswords) {
            throw new use_case_errors_1.InvalidCredentialsError('Invalid credentials');
        }
    }
    async changePasswordUseCase(actorId, oldPassword, newPassword) {
        const oldPasswordValid = password_1.Password.validatePlain(oldPassword);
        const newPasswordValid = password_1.Password.validatePlain(newPassword);
        this.checkPasswordDifference(oldPasswordValid, newPasswordValid);
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();
        await this.comparePasswords(oldPasswordValid, user.getPassword().getHash());
        const newPasswordHash = await this.bcrypter.hash(newPasswordValid);
        user.setPassword(password_1.Password.fromHash(newPasswordHash));
        const saved = await this.userRepoWriter.save(user);
        return this.mapper.mapToDto(saved);
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
