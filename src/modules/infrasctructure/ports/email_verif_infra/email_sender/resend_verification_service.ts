import {UserRepoReader} from "../../../../users/ports/user_repo_interfaces";
import {EmailSenderInterface} from "../email_verification/email_sender_interface";
import {SendVerifEmailShared} from "../../../../users/shared/send_verif_email_shared";
import {EmailVerificationInterface} from "../email_verification/email_verification_interface";
import {UserNotFoundError} from "../../../../users/errors/use_case_errors";


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

        await this.verificationRepo.deleteByUserId(user.id);

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

        await this.verificationRepo.deleteByUserId(user.id);

        await this.sendEmailVerifShared.sendIt(
            user.getEmail().getValue(),
            user,
            "/public/confirm-email-change",
            "change"
        );
    }
}