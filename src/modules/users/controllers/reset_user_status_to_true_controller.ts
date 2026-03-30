import {ResetUserStatusToTrueTxService} from "../transactional_services/reset_user_status_to_true_tx_service";
import {Request, Response} from "express";
import {z} from "zod";


export const ResetUserStatusToTrueBodySchema = z.object({
    email: z.string().email(),
});

type ResetUserStatusToTrueBody = z.infer<typeof ResetUserStatusToTrueBodySchema>;

export class ResetUserStatusToTrueController {
    constructor(private readonly resetUserStatusToTrueService: ResetUserStatusToTrueTxService) {}

    resetUserStatusToTrueCont =
        async (req: Request<{},{},ResetUserStatusToTrueBody>, res: Response) => {
            const {email} = req.body;

            const result = await this.resetUserStatusToTrueService.resetUserStatusToTrueTxService(email);

            return res.status(200).json(result);
    }
}