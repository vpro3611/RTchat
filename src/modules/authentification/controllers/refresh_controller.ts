import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {RefreshTokenNotFound} from "../errors/token_errors";

export class RefreshController {
    constructor(private readonly authService: AuthService) {}

    refreshController = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new RefreshTokenNotFound("Refresh token not found");
        }

        const tokens = await this.authService.refresh(refreshToken);

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV! === "production",
            sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        }).json({accessToken: tokens.accessToken})
    }
}