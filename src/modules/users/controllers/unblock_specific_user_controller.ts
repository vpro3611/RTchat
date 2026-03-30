import {UnblockSpecificUserTxService} from "../transactional_services/unblock_specific_user_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";
import {z} from "zod";

export const UnblockSpecificUserParamsSchema = z.object({
    targetId: z.string(),
});

type UnblockSpecificUserParams = z.infer<typeof UnblockSpecificUserParamsSchema>;


export class UnblockSpecificUserController {
    constructor(private readonly unblockSpecificUserService: UnblockSpecificUserTxService,
                private readonly extractUserId: ExtractUserIdFromReq
    ) {}

    unblockSpecificUserCont =
        async (req: Request<UnblockSpecificUserParams>, res: Response) =>
        {
            const userId = this.extractUserId.extractUserId(req);

            const {targetId} = req.params;

            const result = await this.unblockSpecificUserService.unblockSpecificUserTxService(userId, targetId);

            return res.status(200).json(result);
        }
}