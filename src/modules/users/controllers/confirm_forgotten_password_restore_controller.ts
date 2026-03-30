import {
    ConfirmEmailChangeUseCase
} from "../../infrasctructure/ports/email_verif_infra/email_verif_service/confirm_email_change_use_case";
import {
    ConfirmResetPasswordUseCase
} from "../../infrasctructure/ports/email_verif_infra/email_verif_service/confirm_reset_password_use_case";
import {Request, Response} from "express";


export class ConfirmForgottenPasswordRestoreController {
    constructor(private readonly confirmResetPasswordUseCase: ConfirmResetPasswordUseCase) {
        if (!process.env.FRONTEND_URL) {
            throw new Error("FRONTEND_URL is not defined");
        }
    }

    private getFrontendBaseUrl(): string {
        const rawUrl = process.env.FRONTEND_URL;
        const sanitized = rawUrl?.replace(/^\/+(https?:\/\/)/i, "$1").trim();

        if (!sanitized) {
            throw new Error("FRONTEND_URL is not defined");
        }

        return sanitized.endsWith("/") ? sanitized.slice(0, -1) : sanitized;
    }

    private buildRedirectUrl(status: "success" | "error") {
        const redirectUrl = new URL("/email-verified", `${this.getFrontendBaseUrl()}/`);
        redirectUrl.searchParams.set("status", status);
        redirectUrl.searchParams.set("type", "reset-pass");
        return redirectUrl.toString();
    }

    confirmPasswordReset = async (req: Request, res: Response) => {
        const token = req.query.token as string;

        if (!token) {
            const redirectUrl = this.buildRedirectUrl("error");
            console.warn("[confirm-password-reset] missing token", {redirectUrl});
            return res.redirect(redirectUrl);
        }

        try {
            await this.confirmResetPasswordUseCase.execute(token);
            const redirectUrl = this.buildRedirectUrl("success");
            console.info("[confirm-password-reset] redirect success", {redirectUrl});
            return res.redirect(redirectUrl);
        } catch (error) {
            const redirectUrl = this.buildRedirectUrl("error");
            console.warn("[confirm-password-reset redirect error", {
                redirectUrl,
                error: error instanceof Error ? error.message : String(error),
            });
            return res.redirect(redirectUrl);
        }
    }
}
