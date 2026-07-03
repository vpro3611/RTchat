import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";
import {getCookieOptions} from "./cookie_config";

export const RegisterGoogleBodySchema = z.object({
    username: z.string(),
    password: z.string(),
    registrationToken: z.string(),
});

type RegisterGoogleBody = z.infer<typeof RegisterGoogleBodySchema>;

export class RegisterGoogleController {
    constructor(private readonly authService: AuthService) {}

    registerGoogleController = async (req: Request<{}, {}, RegisterGoogleBody>, res: Response) => {
        const {username, password, registrationToken} = req.body;

        const result = await this.authService.registerByGoogle(username, password, registrationToken);

        res.cookie("refreshToken", result.refreshToken, getCookieOptions())
            .status(201)
            .json({accessToken: result.accessToken, user: result.user});
    }
}
