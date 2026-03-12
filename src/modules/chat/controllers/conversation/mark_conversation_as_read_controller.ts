import {MarkConversationReadTxService} from "../../transactional_services/conversation/mark_conversation_read_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";


export const MarkConversationAsReadParamsSchema = z.object({
    messageId: z.string().uuid(),
    conversationId: z.string().uuid(),
})

type MarkConversationAsReadSchemaType = z.infer<typeof MarkConversationAsReadParamsSchema>;

export class MarkConversationAsReadController {
    constructor(private readonly markConversationAsReadService: MarkConversationReadTxService,
                private readonly extractActorId: ExtractActorId
    ) {}

    markConversationAsReadCont = async (req: Request<MarkConversationAsReadSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {messageId, conversationId} = req.params;

        await this.markConversationAsReadService.markConversationReadTxService(
            actorId.sub,
            conversationId,
            messageId
        );

        return res.status(204).send();
    }
}