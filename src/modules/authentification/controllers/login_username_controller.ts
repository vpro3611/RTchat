import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";
import {getCookieOptions} from "./cookie_config";

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

        res.cookie("refreshToken", result.refreshToken, getCookieOptions())
            .status(200)
            .json({
                accessToken: result.accessToken,
                user: result.user,
            });
    }
}