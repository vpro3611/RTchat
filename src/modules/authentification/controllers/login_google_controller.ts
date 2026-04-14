import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";

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

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV! === "production",
            sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        }).status(200).json({accessToken: result.accessToken, user: result.user});
    }
}
