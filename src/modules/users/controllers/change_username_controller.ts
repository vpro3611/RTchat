import {ChangeUsernameTxService} from "../transactional_services/change_username_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";
import {z} from "zod";

export const ChangeUsernameBodySchema = z.object({
    newUsername: z.string(),
})

type ChangeUsernameBody = z.infer<typeof ChangeUsernameBodySchema>;

export class ChangeUsernameController {
    constructor(private readonly changeUsernameService: ChangeUsernameTxService,
                private readonly extractUserIdFromReq: ExtractUserIdFromReq
    ) {}

    changeUsernameController = async (req: Request<{}, {}, ChangeUsernameBody>, res: Response) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);

        const {newUsername} = req.body;

        const result = await this.changeUsernameService.changeUsernameTxService(userId, newUsername);

        return res.status(200).json(result);
    }
}