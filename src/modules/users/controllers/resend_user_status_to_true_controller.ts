import {
    ResendVerificationService
} from "../../infrasctructure/ports/email_verif_infra/email_sender/resend_verification_service";
import {Request, Response} from "express";
import {z} from "zod";

export const ResendUserStatusToTrueBodySchema = z.object({
    email: z.string().email(),
})

type ResendUserStatusToTrueBody = z.infer<typeof ResendUserStatusToTrueBodySchema>;

export class ResendUserStatusToTrueController {
    constructor(private readonly resendVerificationService: ResendVerificationService) {}

    resendUserStatusToTrueCont =
        async (req: Request<{},{},ResendUserStatusToTrueBody>, res: Response) => {
            const {email} = req.body;

            await this.resendVerificationService
                .resendIsActive(email);

            return res.status(200).json({ok: true});
    }
}