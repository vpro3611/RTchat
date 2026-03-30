import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {
    GetAllRequestListService
} from "../../transactional_services/conversation_requests/get_all_request_list_service";
import {ConversationRequestsStatus} from "../../domain/conversation_requests/conversation_requests";

const ConversationReqStatusSchema = z.enum([
    ConversationRequestsStatus.ACCEPTED,
    ConversationRequestsStatus.REJECTED,
    ConversationRequestsStatus.EXPIRED,
    ConversationRequestsStatus.CANCELLED,
    ConversationRequestsStatus.PENDING,
    ConversationRequestsStatus.WITHDRAWN,
]);

export const GetAllRequestListQuerySchema = z.object({
    status: ConversationReqStatusSchema.optional(),
})


export const GetAllRequestListParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type GetAllRequestListSchemaType = z.infer<typeof GetAllRequestListParamsSchema>;


export class GetAllRequestListController {
    constructor(private readonly getAllRequestListService: GetAllRequestListService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getAllRequestListCont =
        async (req: Request<GetAllRequestListSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {conversationId} = req.params;
            const {status} = GetAllRequestListQuerySchema.parse(req.query);
            const result = await this.getAllRequestListService.getAllRequestListService(
                actorId.sub,
                conversationId,
                status,
            );

            return res.status(200).json(result);
    }
}