import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {RefreshTokenNotFound} from "../errors/token_errors";

export class LogoutController {
    constructor(private readonly authService: AuthService) {}


    logoutController = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new RefreshTokenNotFound("Refresh token not found");
        }

        await this.authService.logout(refreshToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV! === "production",
            sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
        });

        res.status(204).send();
    }
}