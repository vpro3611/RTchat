import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";
import {InternalServerError} from "../../../http_errors_base";

export const VerifyEmailQuerySchema = z.object({
    token: z.string(),
})


export class VerifyEmailController {
    constructor(private readonly authService: AuthService) {
        if (!process.env.FRONTEND_URL) {
            const msg = process.env.NODE_ENV === "production"
                ? "FRONTEND_URL is not defined"
                : "Something wrong with the server";
            throw new InternalServerError(msg);
        }
    }

    private getFrontendBaseUrl(): string {
        const rawUrl = process.env.FRONTEND_URL;
        const sanitized = rawUrl?.replace(/^\/+(https?:\/\/)/i, "$1").trim();

        if (!sanitized) {
            throw new InternalServerError("FRONTEND_URL is not defined");
        }

        return sanitized.endsWith("/") ? sanitized.slice(0, -1) : sanitized;
    }

    private buildRedirectUrl(status: "success" | "error") {
        const redirectUrl = new URL("/email-verified", `${this.getFrontendBaseUrl()}/`);
        redirectUrl.searchParams.set("status", status);
        redirectUrl.searchParams.set("type", "register");
        return redirectUrl.toString();
    }


    verifyEmailController = async (req: Request, res: Response) => {
        try {
            const token: { token: string } = VerifyEmailQuerySchema.parse(req.query);

            await this.authService.verifyEmail(token.token);
            const redirectUrl = this.buildRedirectUrl("success");
            console.info("[verify-email] redirect success", {redirectUrl});
            res.redirect(redirectUrl);
        } catch (error) {
            const redirectUrl = this.buildRedirectUrl("error");
            console.warn("[verify-email] redirect error", {
                redirectUrl,
                error: error instanceof Error ? error.message : String(error),
            });
            res.redirect(redirectUrl);
        }
    }
}