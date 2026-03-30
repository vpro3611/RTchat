import {BlockSpecificUserTxService} from "../transactional_services/block_specific_user_tx_service";
import {Request, Response} from "express";
import {z} from "zod";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";

export const BlockSpecificUserParamsSchema = z.object({
    targetId: z.string(),
});

type BlockSpecificUserParams = z.infer<typeof BlockSpecificUserParamsSchema>;

export class BlockSpecificUserController {
    constructor(private readonly blockSpecificUserService: BlockSpecificUserTxService,
                private readonly extractUserId: ExtractUserIdFromReq
    ) {}


    blockSpecificUserCont =
        async (req: Request<BlockSpecificUserParams>, res: Response) =>
        {
            const userId = this.extractUserId.extractUserId(req);

            const {targetId} = req.params;

            const result = await this.blockSpecificUserService.blockSpecificUserTxService(userId, targetId);

            return res.status(200).json(result);
        }
}