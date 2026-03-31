import {
    ChangeRequestStatusService
} from "../../transactional_services/conversation_requests/change_request_status_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {ConversationRequestsStatus} from "../../domain/conversation_requests/conversation_requests";
import {Server} from "socket.io";

const ConversationReqStatusSchema = z.enum([
    ConversationRequestsStatus.ACCEPTED,
    ConversationRequestsStatus.REJECTED,
    ConversationRequestsStatus.EXPIRED,
    ConversationRequestsStatus.CANCELLED,
]);

export const ChangeRequestStatusBodySchema = z.object({
    status: ConversationReqStatusSchema,
    reviewMessage: z.string().min(1),
});

type ChangeRequestStatusBodySchemaType = z.infer<typeof ChangeRequestStatusBodySchema>;

export const ChangeRequestStatusParamsSchema = z.object({
    conversationId: z.string().uuid(),
    requestId: z.string().uuid(),
})

type ChangeRequestStatusParamsSchemaType = z.infer<typeof ChangeRequestStatusParamsSchema>;

export class ChangeConversationRequestStatusController {
    constructor(private readonly changeConversationRequestStatusService: ChangeRequestStatusService,
                private readonly extractActorId: ExtractActorId,
                private readonly io: Server
    ) {}

    changeConversationRequestStatusCont =
        async (req: Request<ChangeRequestStatusParamsSchemaType,{},ChangeRequestStatusBodySchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);

            const {conversationId, requestId} = req.params;

            const {status, reviewMessage} = req.body;

            const result = await this.changeConversationRequestStatusService.changeRequestStatusService(
                actorId.sub,
                conversationId,
                requestId,
                reviewMessage,
                status,
            );

            // Notify requester about status change
            this.io.to(`user:${result.userId}`).emit("conversation:request_status_changed", result);

            return res.status(200).json(result);
    }
}