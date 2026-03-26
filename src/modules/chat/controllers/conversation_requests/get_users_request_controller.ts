import {GetUsersRequestsService} from "../../transactional_services/conversation_requests/get_users_requests_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {ConversationRequestsStatus} from "../../domain/conversation_requests/conversation_requests";

const ConversationReqStatusSchema = z.enum([
    ConversationRequestsStatus.ACCEPTED,
    ConversationRequestsStatus.REJECTED,
    ConversationRequestsStatus.EXPIRED,
    ConversationRequestsStatus.CANCELLED,
    ConversationRequestsStatus.PENDING,
    ConversationRequestsStatus.WITHDRAWN,
]);

export const GetUsersRequestQuerySchema = z.object({
    status: ConversationReqStatusSchema.optional(),
})

export class GetUsersRequestController {
    constructor(private readonly getUsersRequestService: GetUsersRequestsService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getUsersRequestCont = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const {status} = GetUsersRequestQuerySchema.parse(req.query);

        const result = await this.getUsersRequestService.getUsersRequestsService(
            actorId.sub,
            status
        );

        return res.status(200).json(result);
    }
}