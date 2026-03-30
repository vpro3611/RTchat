import {SaveMessageService} from "../../transactional_services/saved_messages/save_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const SaveMessageParamsSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
})

type SaveMessageSchemaType = z.infer<typeof SaveMessageParamsSchema>;

export class SaveMessageController {
    constructor(private readonly saveMessageService: SaveMessageService,
                private readonly extractActorId: ExtractActorId
    ) {}

    saveMessageCont =
        async (req: Request<SaveMessageSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {conversationId, messageId} = req.params;

            const result = await this.saveMessageService.saveMessageService(
                actorId.sub,
                messageId,
                conversationId
            );
            return res.status(201).send(result);
        }
}