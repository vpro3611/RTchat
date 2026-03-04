import {Request, Response} from "express";
import {ChangePasswordTxService} from "../transactional_services/change_password_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {z} from "zod";

export const ChangePasswordBodySchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
})

type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>;

export class ChangePasswordController {
    constructor(private readonly changePasswordService: ChangePasswordTxService,
                private readonly extractUserId: ExtractUserIdFromReq
    ) {}

    changePasswordController = async (req: Request<{}, {}, ChangePasswordBody>, res: Response) => {
        const userId = this.extractUserId.extractUserId(req);

        const {oldPassword, newPassword} = req.body;

        const result = await this.changePasswordService.changePasswordTxService(userId, oldPassword, newPassword);

        return res.status(200).json(result);
    }
}