import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";

export const LoginUsernameBodySchema = z.object({
    username: z.string(),
    password: z.string(),
})

type LoginUsernameBody = z.infer<typeof LoginUsernameBodySchema>

export class LoginUsernameController {
    constructor(private readonly authService: AuthService) {}


    loginUsernameController = async (req: Request<{}, {}, LoginUsernameBody>, res: Response) => {
        const {username, password} = req.body;

        const result = await this.authService.loginByUsername(username, password);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV! === "production",
            sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).status(200).json({
            accessToken: result.accessToken,
            user: result.user,
        });
    }
}