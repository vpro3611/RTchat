import {
    ConfirmResetActivityUseCase
} from "../../infrasctructure/ports/email_verif_infra/email_verif_service/confirm_reset_activity_use_case";
import {Request, Response} from "express";


export class ConfirmResetActivityController {
    constructor(private readonly confirmResetActivityUseCase: ConfirmResetActivityUseCase) {
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
        redirectUrl.searchParams.set("type", "reset-activity");
        return redirectUrl.toString();
    }

    confirmResetActivity = async (req: Request, res: Response) => {
        const token = req.query.token as string;

        if (!token) {
            const redirectUrl = this.buildRedirectUrl("error");
            return res.redirect(redirectUrl);
        }

        try {
            await this.confirmResetActivityUseCase.execute(token);
            const redirectUrl = this.buildRedirectUrl("success");
            return res.redirect(redirectUrl);
        } catch (error) {
            const redirectUrl = this.buildRedirectUrl("error");
            return res.redirect(redirectUrl);
        }
    }
}
