"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginEmailController = exports.LoginEmailBodySchema = void 0;
const zod_1 = require("zod");
exports.LoginEmailBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
class LoginEmailController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    loginEmailController = async (req, res) => {
        const { email, password } = req.body;
        const result = await this.authService.loginByEmail(email, password);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).status(200).json({ accessToken: result.accessToken, user: result.user });
    };
}
exports.LoginEmailController = LoginEmailController;
