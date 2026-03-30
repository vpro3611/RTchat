"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailController = exports.VerifyEmailQuerySchema = void 0;
const zod_1 = require("zod");
const http_errors_base_1 = require("../../../http_errors_base");
exports.VerifyEmailQuerySchema = zod_1.z.object({
    token: zod_1.z.string(),
});
class VerifyEmailController {
    authService;
    constructor(authService) {
        this.authService = authService;
        if (!process.env.FRONTEND_URL) {
            const msg = process.env.NODE_ENV === "production"
                ? "FRONTEND_URL is not defined"
                : "Something wrong with the server";
            throw new http_errors_base_1.InternalServerError(msg);
        }
    }
    getFrontendBaseUrl() {
        const rawUrl = process.env.FRONTEND_URL;
        const sanitized = rawUrl?.replace(/^\/+(https?:\/\/)/i, "$1").trim();
        if (!sanitized) {
            throw new http_errors_base_1.InternalServerError("FRONTEND_URL is not defined");
        }
        return sanitized.endsWith("/") ? sanitized.slice(0, -1) : sanitized;
    }
    buildRedirectUrl(status) {
        const redirectUrl = new URL("/email-verified", `${this.getFrontendBaseUrl()}/`);
        redirectUrl.searchParams.set("status", status);
        redirectUrl.searchParams.set("type", "register");
        return redirectUrl.toString();
    }
    verifyEmailController = async (req, res) => {
        try {
            const token = exports.VerifyEmailQuerySchema.parse(req.query);
            await this.authService.verifyEmail(token.token);
            const redirectUrl = this.buildRedirectUrl("success");
            console.info("[verify-email] redirect success", { redirectUrl });
            res.redirect(redirectUrl);
        }
        catch (error) {
            const redirectUrl = this.buildRedirectUrl("error");
            console.warn("[verify-email] redirect error", {
                redirectUrl,
                error: error instanceof Error ? error.message : String(error),
            });
            res.redirect(redirectUrl);
        }
    };
}
exports.VerifyEmailController = VerifyEmailController;
