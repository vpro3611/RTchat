import {EmailSenderInterface} from "../email_verification/email_sender_interface";
import {Transporter} from "nodemailer";
import nodemailer from "nodemailer";
import {EmailSendError} from "../errors/email_send_errors";

export class EmailSenderNodemailer implements EmailSenderInterface {
    private readonly transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    private normalizeBaseUrl(rawUrl: string | undefined, envName: "API_URL" | "FRONTEND_URL"): string {
        if (!rawUrl) {
            throw new Error(`${envName} is not defined`);
        }

        const sanitized = rawUrl.replace(/^\/+(https?:\/\/)/i, "$1").trim();

        return sanitized.endsWith("/") ? sanitized : `${sanitized}/`;
    }

    async sendVerificationEmail(
        email: string,
        token: string,
        path: string,
        flowType: "register" | "change"
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
            await this.transporter.verify();

            await this.transporter.sendMail({
                from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Verify your email",
                html: `
          <h3>Email verification</h3>
          <p>Click the link below to verify your email and account:</p>
          <a href="${verificationUrl.toString()}">${verificationUrl.toString()}</a>
        `,
            });
        } catch (error) {
            if (error instanceof Error && process.env.NODE_ENV !== "production") {
                throw new EmailSendError(`${error.message} - FAILED TO SEND EMAIL`);
            }
            throw new EmailSendError(`EMAIL_SEND_FAILED`);
        }
    }
}