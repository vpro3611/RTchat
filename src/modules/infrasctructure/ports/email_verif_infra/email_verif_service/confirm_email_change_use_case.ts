import {EmailVerificationInterface} from "../email_verification/email_verification_interface";
import {UserRepoWriter} from "../../../../users/ports/user_repo_interfaces";
import {InvalidTokenError} from "../errors/token_errors";
import * as crypto from "node:crypto";

export class ConfirmEmailChangeUseCase {
    constructor(private readonly verificationService: EmailVerificationInterface,
                private readonly userRepoWriter: UserRepoWriter
    ) {}

    private async getRecord(tokenHash: string) {
        const record = await this.verificationService.findByTokenHash(tokenHash);

        if (!record) {
            throw new InvalidTokenError('Invalid or expired token');
        }
        return record;
    }

    async execute(rawToken: string) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const record = await this.getRecord(tokenHash);

        await this.userRepoWriter.confirmPendingEmail(record.userId);

        await this.verificationService.deleteByUserId(record.userId);
    }
}