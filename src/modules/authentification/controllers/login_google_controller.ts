import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";
import {getCookieOptions} from "./cookie_config";

export const LoginGoogleBodySchema = z.object({
    idToken: z.string(),
});

type LoginGoogleBody = z.infer<typeof LoginGoogleBodySchema>;

export class LoginGoogleController {
    constructor(private readonly authService: AuthService) {}

    loginGoogleController = async (req: Request<{}, {}, LoginGoogleBody>, res: Response) => {
        const {idToken} = req.body;

        const clientId = process.env.CLIENT_ID;
        if (!clientId) {
            throw new Error("CLIENT_ID is not configured");
        }

        const result = await this.authService.loginByGoogle(idToken, clientId);

        if (result.requiresRegistration) {
            return res.status(200).json({
                requiresRegistration: true,
                registrationToken: result.registrationToken,
                message: "Account not found. Please complete registration."
            });
        }

        res.cookie("refreshToken", result.refreshToken, getCookieOptions())
            .status(200)
            .json({accessToken: result.accessToken, user: result.user});
    }
}
