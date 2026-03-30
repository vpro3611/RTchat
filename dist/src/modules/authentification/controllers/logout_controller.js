"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutController = void 0;
const token_errors_1 = require("../errors/token_errors");
class LogoutController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    logoutController = async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new token_errors_1.RefreshTokenNotFound("Refresh token not found");
        }
        await this.authService.logout(refreshToken);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });
        res.status(204).send();
    };
}
exports.LogoutController = LogoutController;
