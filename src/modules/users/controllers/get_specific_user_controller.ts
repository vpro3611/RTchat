import {GetSpecificUserTxService} from "../transactional_services/get_specific_user_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetSpecificUserParamsSchema = z.object({
    targetId: z.string(),
})

type GetSpecificUserParams = z.infer<typeof GetSpecificUserParamsSchema>;

export class GetSpecificUserController {
    constructor(private readonly getSpecificUserService: GetSpecificUserTxService,
                private readonly extractUserIdFromReq: ExtractUserIdFromReq
    ) {}

    getSpecificUserController = async (req: Request<GetSpecificUserParams>, res: Response) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);

        const {targetId} = req.params;

        const result = await this.getSpecificUserService.getSpecificUserTxService(userId, targetId);

        return res.status(200).json(result);
    }
}