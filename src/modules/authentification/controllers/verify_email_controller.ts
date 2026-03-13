import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";
import {InternalServerError} from "../../../http_errors_base";

export const VerifyEmailQuerySchema = z.object({
    token: z.string(),
})


export class VerifyEmailController {
    constructor(private readonly authService: AuthService) {
        if (!process.env.FRONTEND_URL) {
            const msg = process.env.NODE_ENV === "production"
                ? "FRONTEND_URL is not defined"
                : "Something wrong with the server";
            throw new InternalServerError(msg);
        }
    }


    verifyEmailController = async (req: Request, res: Response) => {
        try {
            const token: { token: string } = VerifyEmailQuerySchema.parse(req.query);

            await this.authService.verifyEmail(token.token);

            res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=success`);
        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/email-verification?status=error`);
        }
    }
}