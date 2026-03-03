import {EmailSenderInterface} from "../email_verification/email_sender_interface";
import {Transporter} from "nodemailer";
import nodemailer from "nodemailer";
import {EmailSendError} from "../errors/email_send_errors";

export class EmailSenderNodemailer implements EmailSenderInterface {
    private readonly transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

//
    async sendVerificationEmail(
        email: string,
        token: string
    ): Promise<void> {

        const verificationUrl =
            `${process.env.APP_URL}/verify-email?token=${token}`;

        try {
            await this.transporter.verify();

            await this.transporter.sendMail({
                from: `"MyApp" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Verify your email",
                html: `
          <h3>Email verification</h3>
          <p>Click the link below to verify your account:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
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