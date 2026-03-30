import {RemoveSavedMessageService} from "../../transactional_services/saved_messages/remove_saved_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const RemoveSavedMessageParamsSchema = z.object({
    messageId: z.string().uuid(),
})

type RemoveSavedMessageSchemaType = z.infer<typeof RemoveSavedMessageParamsSchema>;

export class RemoveSavedMessageController {
    constructor(private readonly removeSavedMessageService: RemoveSavedMessageService,
                private readonly extractActorId: ExtractActorId
    ) {}

    removeSavedMessageCont =
        async (req: Request<RemoveSavedMessageSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {messageId} = req.params;


            await this.removeSavedMessageService.removeSavedMessageService(
                actorId.sub,
                messageId
            );

            return res.status(204).send();
    }

}