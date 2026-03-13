import {
    CreateGroupConversationTxService
} from "../../transactional_services/conversation/create_group_conversation_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const CreateGroupConversationBodySchema = z.object({
    title: z.string().min(1)
})

type CreateGroupConversationSchemaType = z.infer<typeof CreateGroupConversationBodySchema>;

export class CreateGroupConversationController {
    constructor(private readonly createGroupConversationService: CreateGroupConversationTxService,
                private readonly extractActorId: ExtractActorId
    ) {}

    createGroupConversationCont = async (req: Request<{},{},CreateGroupConversationSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const {title} = req.body;

        const result = await this.createGroupConversationService.createGroupConversationTxService(title, actorId.sub);

        return res.status(201).json(result);
    }
}