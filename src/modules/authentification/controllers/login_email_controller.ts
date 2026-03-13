import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";

export const LoginEmailBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

type LoginEmailBody = z.infer<typeof LoginEmailBodySchema>

export class LoginEmailController {
    constructor(private readonly authService: AuthService) {}

    loginEmailController = async (req: Request<{}, {}, LoginEmailBody>, res: Response) => {
        const {email, password} = req.body;

        const result = await this.authService.loginByEmail(email, password);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV! === "production",
            sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).status(200).json({accessToken: result.accessToken, user: result.user});
    }
}