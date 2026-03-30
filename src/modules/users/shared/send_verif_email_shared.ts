import {
    EmailSenderInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_sender_interface";
import {
    EmailVerificationInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";
import crypto from "node:crypto";
import {User} from "../domain/user";
import {FlowType} from "../../infrasctructure/ports/email_verif_infra/email_sender/email_sender";


export class SendVerifEmailShared {
    constructor(private readonly emailSender: EmailSenderInterface,
                private readonly emailVerificationRepo: EmailVerificationInterface,
    ) {}

    private createToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    private createTokenHash(rawToken: string) {
        return crypto.createHash('sha256').update(rawToken).digest('hex');
    }

    private async saveToRepo(tokenHash: string, saved: User, tokenType: string) {
        await this.emailVerificationRepo.saveToken({
            id: crypto.randomUUID(),
            userId: saved.id,
            tokenHash: tokenHash,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
            tokenType: tokenType,
        })
    }

    async sendIt(
        email: string,
        saved: User,
        path: string,
        flowType: FlowType,
    ) {
        const rawToken = this.createToken();

        const tokenHash = this.createTokenHash(rawToken);

        await this.saveToRepo(tokenHash, saved, flowType);

        await this.emailSender.sendVerificationEmail(email, rawToken, path, flowType);
    }
}
