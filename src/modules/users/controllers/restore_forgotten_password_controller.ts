import {ResetPasswordTxService} from "../transactional_services/reset_password_tx_service";
import {Request, Response} from "express";
import {z} from "zod";

export const RestoreForgottenPasswordBodySchema = z.object({
    email: z.string().email(),
    newPassword: z.string(),
})

type RestoreForgottenPasswordBody = z.infer<typeof RestoreForgottenPasswordBodySchema>;

export class RestoreForgottenPasswordController {
    constructor(private readonly restoreForgottenPasswordService: ResetPasswordTxService) {}

    restoreForgottenPasswordCont =
        async (req: Request<{},{},RestoreForgottenPasswordBody>, res: Response) => {
            const {email, newPassword} = req.body;

            const result = await this.restoreForgottenPasswordService
                .resetPasswordTxService(
                    email,
                    newPassword
                );

            return res.status(200).json(result);
    }
}

