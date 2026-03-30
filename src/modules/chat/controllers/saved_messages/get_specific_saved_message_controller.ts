import {
    GetSpecificSavedMessageService
} from "../../transactional_services/saved_messages/get_specific_saved_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetSpecificSavedMessageParamsSchema = z.object({
    messageId: z.string().uuid(),
})

type GetSpecificSavedMessageSchemaType = z.infer<typeof GetSpecificSavedMessageParamsSchema>;

export class GetSpecificSavedMessageController {
    constructor(private readonly getSpecificSavedMessageService: GetSpecificSavedMessageService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getSpecificSavedMessageCont =
        async (req: Request<GetSpecificSavedMessageSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {messageId} = req.params;

            const result = await this.getSpecificSavedMessageService.getSpecificSavedMessageService(
                actorId.sub,
                messageId
            );

            return res.status(200).json(result);
    }

}