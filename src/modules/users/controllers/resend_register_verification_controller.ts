import {
    ResendVerificationService
} from "../../infrasctructure/ports/email_verif_infra/email_sender/resend_verification_service";
import {Request, Response} from "express";
import {z} from "zod";

export const ResendRegisterVerificationBodySchema = z.object({
    email: z.string().email(),
})

type ResendRegisterVerificationBody = z.infer<typeof ResendRegisterVerificationBodySchema>;

export class ResendRegisterVerificationController {
    constructor(private readonly resendVerificationService: ResendVerificationService) {}


    resendRegisterVerificationCont =
        async (req: Request<{},{},ResendRegisterVerificationBody>, res: Response) =>
        {
            const {email} = req.body;

            await this.resendVerificationService.resendRegister(email);

            return res.status(200).json({ok: true});
        }
}