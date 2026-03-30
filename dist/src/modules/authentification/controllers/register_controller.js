"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = exports.RegisterBodySchema = void 0;
const zod_1 = require("zod");
exports.RegisterBodySchema = zod_1.z.object({
    username: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
class RegisterController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    registerController = async (req, res) => {
        const { username, email, password } = req.body;
        const result = await this.authService.register(username, email, password);
        return res.status(201).json({
            message: "User created successfully. Please verify your email.",
            user: result.user,
        });
    };
}
exports.RegisterController = RegisterController;
