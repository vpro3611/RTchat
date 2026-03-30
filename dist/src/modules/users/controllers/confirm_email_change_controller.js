"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmEmailChangeController = void 0;
class ConfirmEmailChangeController {
    confirmEmailChangeUseCase;
    constructor(confirmEmailChangeUseCase) {
        this.confirmEmailChangeUseCase = confirmEmailChangeUseCase;
        if (!process.env.FRONTEND_URL) {
            throw new Error("FRONTEND_URL is not defined");
        }
    }
    getFrontendBaseUrl() {
        const rawUrl = process.env.FRONTEND_URL;
        const sanitized = rawUrl?.replace(/^\/+(https?:\/\/)/i, "$1").trim();
        if (!sanitized) {
            throw new Error("FRONTEND_URL is not defined");
        }
        return sanitized.endsWith("/") ? sanitized.slice(0, -1) : sanitized;
    }
    buildRedirectUrl(status) {
        const redirectUrl = new URL("/email-verified", `${this.getFrontendBaseUrl()}/`);
        redirectUrl.searchParams.set("status", status);
        redirectUrl.searchParams.set("type", "change");
        return redirectUrl.toString();
    }
    confirmEmailChangeCont = async (req, res) => {
        const token = req.query.token;
        if (!token) {
            const redirectUrl = this.buildRedirectUrl("error");
            console.warn("[confirm-email-change] missing token", { redirectUrl });
            return res.redirect(redirectUrl);
        }
        try {
            await this.confirmEmailChangeUseCase.execute(token);
            const redirectUrl = this.buildRedirectUrl("success");
            console.info("[confirm-email-change] redirect success", { redirectUrl });
            return res.redirect(redirectUrl);
        }
        catch (error) {
            const redirectUrl = this.buildRedirectUrl("error");
            console.warn("[confirm-email-change] redirect error", {
                redirectUrl,
                error: error instanceof Error ? error.message : String(error),
            });
            return res.redirect(redirectUrl);
        }
    };
}
exports.ConfirmEmailChangeController = ConfirmEmailChangeController;
