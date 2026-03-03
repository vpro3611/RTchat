import {EmailVerificationInterface} from "../email_verification/email_verification_interface";
import {UserRepoWriter} from "../../../../users/ports/user_repo_interfaces";
import * as crypto from "node:crypto";
import {InvalidTokenError} from "../errors/token_errors";

export class EmailVerificationUseCase {
    constructor(private readonly verificationRepo: EmailVerificationInterface,
                private readonly userRepoWriter: UserRepoWriter
    ) {}

    private async getRecord(tokenHash: string) {
        const record = await this.verificationRepo.findByTokenHash(tokenHash);

        if (!record) {
            throw new InvalidTokenError('Invalid or expired token');
        }
        return record;
    }

    async execute(rawToken: string): Promise<void> {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const record = await this.getRecord(tokenHash);

        await this.userRepoWriter.markAsVerified(record.userId);

        await this.verificationRepo.deleteByUserId(record.userId);
    }
}