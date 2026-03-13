import {GetUserConversationsTxService} from "../../transactional_services/conversation/get_user_conversations_service";
import {ExtractUserIdFromReq} from "../../../users/shared/extract_user_id_from_req";
import {Request, Response} from "express";
import {z} from "zod";
import {ExtractActorId} from "../../shared/extract_actor_id_req";

export const GetUserConversationQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional(),
    cursor: z.string().optional(),
})

export class GetUserConversationController {
    constructor(private readonly getUserConversationService: GetUserConversationsTxService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getUserConversationCont = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {limit, cursor} = GetUserConversationQuerySchema.parse(req.query);

        const result = await this.getUserConversationService.getUserConversationTxService(
            actorId.sub,
            limit,
            cursor
        );

        return res.status(200).json(result);
    }
}