import {EmailVerificationInterface} from "../email_verification/email_verification_interface";
import {UserRepoWriter} from "../../../../users/ports/user_repo_interfaces";
import {InvalidTokenError} from "../errors/token_errors";
import crypto from "node:crypto";


export class ConfirmResetPasswordUseCase {
    constructor(private readonly emailVerificationService: EmailVerificationInterface,
                private readonly userRepoWriter: UserRepoWriter
    ) {}

    private async getRecord(tokenHash: string) {
        const record = await this.emailVerificationService.findByTokenHash(tokenHash);

        if (!record) {
            throw new InvalidTokenError('Invalid or expired token');
        }
        return record;
    }

    async execute(rawToken: string) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const record = await this.getRecord(tokenHash);

        if (record.tokenType !== 'reset-pass') {
            throw new InvalidTokenError('Invalid token type');
        }

        await this.userRepoWriter.confirmPendingPassword(
            record.userId,
        );

        await this.emailVerificationService.deleteByTokenHash(tokenHash);
    }
}