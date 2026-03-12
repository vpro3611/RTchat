import {
    UpdateConversationTitleTxService
} from "../../transactional_services/conversation/update_conversation_title_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const UpdateConversationTitleBodySchema = z.object({
    title: z.string().min(1)
})

type UpdateConversationTitleSchemaType = z.infer<typeof UpdateConversationTitleBodySchema>;


export const UpdateConversationTitleParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type UpdateConversationTitleParamsSchemaType = z.infer<typeof UpdateConversationTitleParamsSchema>;

export class UpdateConversationTitleController {
    constructor(private readonly updateConversationTitleService: UpdateConversationTitleTxService,
                private readonly extractActorId: ExtractActorId
    ) {}

    updateConversationTitleCont =
        async (req: Request<UpdateConversationTitleParamsSchemaType, {}, UpdateConversationTitleSchemaType>, res: Response) =>
        {
            const actorId = this.extractActorId.extractActorId(req);

            const {conversationId} = req.params;

            const {title} = req.body;

            const result = await this.updateConversationTitleService.updateConversationTitleTxService(
                actorId.sub,
                conversationId,
                title
            )

            return res.status(200).json(result);
        }
}