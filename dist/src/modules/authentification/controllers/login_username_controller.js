"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUsernameController = exports.LoginUsernameBodySchema = void 0;
const zod_1 = require("zod");
exports.LoginUsernameBodySchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
class LoginUsernameController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    loginUsernameController = async (req, res) => {
        const { username, password } = req.body;
        const result = await this.authService.loginByUsername(username, password);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).status(200).json({
            accessToken: result.accessToken,
            user: result.user,
        });
    };
}
exports.LoginUsernameController = LoginUsernameController;
