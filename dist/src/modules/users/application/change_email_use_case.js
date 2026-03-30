"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeEmailUseCase = void 0;
const email_1 = require("../domain/email");
const email_errors_1 = require("../errors/email_errors");
const user_database_error_1 = require("../errors/user_database_error");
class ChangeEmailUseCase {
    userRepoReader;
    userRepoWriter;
    mapper;
    userLookup;
    sendEmailVerifShared;
    constructor(userRepoReader, userRepoWriter, mapper, userLookup, sendEmailVerifShared) {
        this.userRepoReader = userRepoReader;
        this.userRepoWriter = userRepoWriter;
        this.mapper = mapper;
        this.userLookup = userLookup;
        this.sendEmailVerifShared = sendEmailVerifShared;
    }
    async checkUserWithSameEmail(email) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (user) {
            throw new email_errors_1.EmailAlreadyExistsError(`User with this email: ${email} already exists`);
        }
    }
    async changeEmailUseCase(actorId, newEmail) {
        try {
            const newEmailValid = email_1.Email.create(newEmail);
            const user = await this.userLookup.getUserOrThrow(actorId);
            await this.checkUserWithSameEmail(newEmailValid.getValue());
            await this.sendEmailVerifShared.sendIt(newEmailValid.getValue(), user, "/public/confirm-email-change", "change");
            await this.userRepoWriter.setPendingEmail(actorId, newEmailValid.getValue());
            return this.mapper.mapToDto(user);
        }
        catch (error) {
            if (error instanceof user_database_error_1.EmailAlreadyExistDatabaseError) {
                throw new email_errors_1.EmailAlreadyExistsError(`User with this email already exists`);
            }
            throw error;
        }
    }
}
exports.ChangeEmailUseCase = ChangeEmailUseCase;
