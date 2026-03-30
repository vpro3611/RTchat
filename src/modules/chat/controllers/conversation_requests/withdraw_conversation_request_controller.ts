import {WithdrawRequestService} from "../../transactional_services/conversation_requests/withdraw_request_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const WithdrawConversationRequestParamsSchema = z.object({
    requestId: z.string().uuid(),
})

type WithdrawConversationRequestSchemaType = z.infer<typeof WithdrawConversationRequestParamsSchema>;

export class WithdrawConversationRequestController {
    constructor(private readonly withdrawConversationRequestService: WithdrawRequestService,
                private readonly extractActorId: ExtractActorId
    ) {}

    withdrawConversationRequestCont =
        async (req: Request<WithdrawConversationRequestSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {requestId} = req.params;

            const result = await this.withdrawConversationRequestService.withdrawRequestService(
                actorId.sub,
                requestId
            );

            return res.status(200).json(result);
    }
}