import {
    CreateDirectConversationTxService
} from "../../transactional_services/conversation/create_direct_conversation_service";
import {Request, Response} from "express";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {z} from "zod";

export const CreateDirectConversationParamsSchema = z.object({
    targetId: z.string().uuid(),
});

type CreateDirectConversationSchemaType = z.infer<typeof CreateDirectConversationParamsSchema>;

export class CreateDirectConversationController {
    constructor(private readonly createDirectConversationService: CreateDirectConversationTxService,
                private readonly extractActorId: ExtractActorId
    ) {};

    createDirectConversationCont = async (req: Request<CreateDirectConversationSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {targetId} = req.params;

        const result = await this.createDirectConversationService.createDirectConversationTxService(
            actorId.sub,
            targetId
        )

        return res.status(201).json(result);
    }
}