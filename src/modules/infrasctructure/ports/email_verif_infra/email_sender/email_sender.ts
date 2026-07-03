import {EmailSenderInterface} from "../email_verification/email_sender_interface";
import {EmailSendError} from "../errors/email_send_errors";
import {Resend} from "resend";

export type FlowType = "register" | "change" | "reset-pass" | "reset-activity";

export class EmailSenderResend implements EmailSenderInterface {
    private normalizeBaseUrl(rawUrl: string | undefined, envName: "API_URL" | "FRONTEND_URL"): string {
        if (!rawUrl) {
            throw new Error(`${envName} is not defined`);
        }

        const sanitized = rawUrl.replace(/^\/+(https?:\/\/)/i, "$1").trim();

        return sanitized.endsWith("/") ? sanitized : `${sanitized}/`;
    }

    private getClient(): Resend {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not defined");
        }

        return new Resend(process.env.RESEND_API_KEY);
    }

    private getFromAddress(): string {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER;

        if (!fromEmail) {
            throw new Error("RESEND_FROM_EMAIL is not defined");
        }

        return `"${process.env.APP_NAME}" <${fromEmail}>`;
    }

    async sendVerificationEmail(
        email: string,
        token: string,
        path: string,
        flowType: FlowType
    ): Promise<void> {
        const apiBaseUrl = this.normalizeBaseUrl(process.env.API_URL, "API_URL");
        const verificationUrl = new URL(path.replace(/^\//, ""), apiBaseUrl);
        verificationUrl.searchParams.set("token", token);
        verificationUrl.searchParams.set("type", flowType);

        console.info("[email-verification] generated link", {
            flowType,
            path,
            verificationUrl: verificationUrl.toString(),
            recipient: email,
        });
        try {
            const {error} = await this.getClient().emails.send({
                from: this.getFromAddress(),
                to: email,
                subject: "Verify your email",
                html: `
          <h3>Email verification</h3>
          <p>Click the link below to verify your email and account:</p>
          <a href="${verificationUrl.toString()}">${verificationUrl.toString()}</a>
        `,
            });

            if (error) {
                throw new Error(error.message);
            }
        } catch (error) {
            if (error instanceof Error && process.env.NODE_ENV !== "production") {
                throw new EmailSendError(`${error.message} - FAILED TO SEND EMAIL`);
            }
            throw new EmailSendError(`EMAIL_SEND_FAILED`);
        }
    }
}
