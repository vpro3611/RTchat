"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSenderNodemailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_send_errors_1 = require("../errors/email_send_errors");
class EmailSenderNodemailer {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    normalizeBaseUrl(rawUrl, envName) {
        if (!rawUrl) {
            throw new Error(`${envName} is not defined`);
        }
        const sanitized = rawUrl.replace(/^\/+(https?:\/\/)/i, "$1").trim();
        return sanitized.endsWith("/") ? sanitized : `${sanitized}/`;
    }
    async sendVerificationEmail(email, token, path, flowType) {
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
        }
        catch (error) {
            if (error instanceof Error && process.env.NODE_ENV !== "production") {
                throw new email_send_errors_1.EmailSendError(`${error.message} - FAILED TO SEND EMAIL`);
            }
            throw new email_send_errors_1.EmailSendError(`EMAIL_SEND_FAILED`);
        }
    }
}
exports.EmailSenderNodemailer = EmailSenderNodemailer;
