import {
    ResendVerificationService
} from "../../infrasctructure/ports/email_verif_infra/email_sender/resend_verification_service";
import {Request, Response} from "express";
import {z} from "zod";

export const ResendResetForgottenPasswordBodySchema = z.object({
    email: z.string().email(),
})

type ResendResetForgottenPasswordBody = z.infer<typeof ResendResetForgottenPasswordBodySchema>;

export class ResendResetForgottenPasswordController {
    constructor(private readonly resendVerificationService: ResendVerificationService) {}


    resendResetForgottenPasswordCont =
        async (req: Request<{},{},ResendResetForgottenPasswordBody>, res: Response) => {
            const {email} = req.body;

            await this.resendVerificationService.resendResetPassword(email);

            return res.status(200).json({ok: true});
        }
}