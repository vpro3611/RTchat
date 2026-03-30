"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendVerificationService = void 0;
const use_case_errors_1 = require("../../../../users/errors/use_case_errors");
class ResendVerificationService {
    userRepoReader;
    sendEmailVerifShared;
    verificationRepo;
    constructor(userRepoReader, sendEmailVerifShared, verificationRepo) {
        this.userRepoReader = userRepoReader;
        this.sendEmailVerifShared = sendEmailVerifShared;
        this.verificationRepo = verificationRepo;
    }
    async checkUserReg(email) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError('User not found');
        }
        return user;
    }
    async checkUserChangeEmail(userId) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError('User not found');
        }
        return user;
    }
    async resendRegister(email) {
        const user = await this.checkUserReg(email);
        await this.verificationRepo.deleteByUserId(user.id);
        await this.sendEmailVerifShared.sendIt(user.getEmail().getValue(), user, "/public/verify-email", "register");
    }
    async resendChangeEmail(userId) {
        const user = await this.checkUserChangeEmail(userId);
        user.ensureIsVerifiedAndActive();
        const pendingEmail = await this.userRepoReader.getPendingEmailByUserId(userId);
        if (!pendingEmail) {
            throw new use_case_errors_1.PendingEmailNotFoundError("No pending email change found");
        }
        await this.verificationRepo.deleteByUserId(user.id);
        await this.sendEmailVerifShared.sendIt(pendingEmail, user, "/public/confirm-email-change", "change");
    }
}
exports.ResendVerificationService = ResendVerificationService;
