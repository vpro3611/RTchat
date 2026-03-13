import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";

export const VerifyEmailQuerySchema = z.object({
    token: z.string(),
})


export class VerifyEmailController {
    constructor(private readonly authService: AuthService) {}


    verifyEmailController = async (req: Request, res: Response) => {
        try {
            const token: { token: string } = VerifyEmailQuerySchema.parse(req.query);

            await this.authService.verifyEmail(token.token);

            return res.status(200).json({message: "Email verified successfully"});
        } catch (error) {
            return res.status(400).json({message: "Invalid or expired token"});
        }
    }
}