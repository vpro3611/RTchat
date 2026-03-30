import {UserRepoReader} from "../../../../users/ports/user_repo_interfaces";
import {EmailSenderInterface} from "../email_verification/email_sender_interface";
import {SendVerifEmailShared} from "../../../../users/shared/send_verif_email_shared";
import {EmailVerificationInterface} from "../email_verification/email_verification_interface";
import {
    PendingEmailNotFoundError,
    PendingPasswordNotFoundError,
    UserNotFoundError
} from "../../../../users/errors/use_case_errors";
import {ConflictError} from "../../../../../http_errors_base";


export class ResendVerificationService {
    constructor(
        private readonly userRepoReader: UserRepoReader,
        private readonly sendEmailVerifShared: SendVerifEmailShared,
        private readonly verificationRepo: EmailVerificationInterface,
    ) {}

    private async checkUserReg(email: string) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (!user) {
            throw new UserNotFoundError('User not found');
        }
        return user;
    }

    private async checkUserChangeEmail(userId: string) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError('User not found');
        }
        return user;
    }

    async resendRegister(email: string) {
        const user = await this.checkUserReg(email);

        await this.verificationRepo.deleteByUserIdAndType(user.id, "register");

        await this.sendEmailVerifShared.sendIt(
            user.getEmail().getValue(),
            user,
            "/public/verify-email",
            "register"
        );
    }

    async resendChangeEmail(userId: string) {
        const user = await this.checkUserChangeEmail(userId);

        user.ensureIsVerifiedAndActive();

        const pendingEmail = await this.userRepoReader.getPendingEmailByUserId(userId);
        if (!pendingEmail) {
            throw new PendingEmailNotFoundError("No pending email change found");
        }

        await this.verificationRepo.deleteByUserIdAndType(user.id, "change");

        await this.sendEmailVerifShared.sendIt(
            pendingEmail,
            user,
            "/public/confirm-email-change",
            "change"
        );
    }

    async resendResetPassword(email: string) {
        const user = await this.checkUserReg(email);

        user.ensureIsVerifiedAndActive();

        const pendingPassword = await this.userRepoReader.getPendingPasswordByUserId(user.id);

        if (!pendingPassword) {
            throw new PendingPasswordNotFoundError("No pending password reset found");
        }

        await this.verificationRepo.deleteByUserIdAndType(user.id, "reset-pass");

        await this.sendEmailVerifShared.sendIt(
            email,
            user,
            "/public/confirm-reset-password",
            "reset-pass"
        );
    }

    async resendIsActive(email: string) {
        const user = await this.checkUserReg(email);

        user.ensureIsVerified();

        if (user.getIsActive()) {
            throw new ConflictError("User is already active");
        }

        const pendingIsActive = await this.userRepoReader.getPendingIsActiveByUserId(user.id);

        if (pendingIsActive === null) {
            throw new ConflictError("No pending activation found");
        }

        await this.verificationRepo.deleteByUserIdAndType(user.id, "reset-activity");

        await this.sendEmailVerifShared.sendIt(
            email,
            user,
            "/public/confirm-reset-activity",
            "reset-activity"
        );
    }
}