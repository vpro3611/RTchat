import {
    CreateConversationRequestService
} from "../../transactional_services/conversation_requests/cretate_conversation_reques_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const CreateConversationRequestBodySchema = z.object({
    requestMessage: z.string().min(1),
})

type CreateConversationRequestBodySchemaType = z.infer<typeof CreateConversationRequestBodySchema>;

export const CreateConversationRequestParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type CreateConversationRequestParamsSchemaType = z.infer<typeof CreateConversationRequestParamsSchema>;

export class CreateConversationRequestController {
    constructor(private readonly createConversationRequestService: CreateConversationRequestService,
                private readonly extractActorId: ExtractActorId
    ) {}


    createConvRequestCont =
        async(req: Request<CreateConversationRequestParamsSchemaType, {}, CreateConversationRequestBodySchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);

            const {conversationId} = req.params;
            const {requestMessage} = req.body;

            const result = await this.createConversationRequestService.createConversationRequestService(
                actorId.sub,
                conversationId,
                requestMessage
            );

            return res.status(201).json(result);
    }
}