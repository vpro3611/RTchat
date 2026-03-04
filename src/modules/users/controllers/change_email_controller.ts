
import {Request, Response} from "express";
import {z} from "zod";
import {ChangeEmailTxService} from "../transactional_services/change_email_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";


export const ChangeEmailBodySchema = z.object({
    newEmail: z.string().email(),
});

type ChangeEmailBody = z.infer<typeof ChangeEmailBodySchema>;

export class ChangeEmailController {
    constructor(private readonly changeEmailService: ChangeEmailTxService,
                private readonly extractUserId: ExtractUserIdFromReq
    ) {}
    changeEmailController = async (req: Request<{}, {}, ChangeEmailBody>, res: Response) => {
        const userId = this.extractUserId.extractUserId(req);

        const {newEmail} = req.body;

        const result = await this.changeEmailService.changeEmailTxService(userId, newEmail);

        return res.status(200).json(result);
    }
}