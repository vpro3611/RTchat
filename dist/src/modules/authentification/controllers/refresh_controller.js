"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshController = void 0;
const token_errors_1 = require("../errors/token_errors");
class RefreshController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    refreshController = async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new token_errors_1.RefreshTokenNotFound("Refresh token not found");
        }
        const tokens = await this.authService.refresh(refreshToken);
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({ accessToken: tokens.accessToken });
    };
}
exports.RefreshController = RefreshController;
