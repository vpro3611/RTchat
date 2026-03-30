import {GetSpecificMessageService} from "../../transactional_services/message/get_specific_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetSpecificMessageParamsSchema = z.object({
    messageId: z.string().uuid(),
    conversationId: z.string().uuid(),
})

type GetSpecificMessageSchemaType = z.infer<typeof GetSpecificMessageParamsSchema>;

export class GetSpecificMessageController {
    constructor(private readonly getSpecificMessageService: GetSpecificMessageService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getSpecificMessageCont =
        async (req: Request<GetSpecificMessageSchemaType>, res: Response) =>
    {
        const actorId = this.extractActorId.extractActorId(req);
        const {messageId, conversationId} = req.params;

        const result = await this.getSpecificMessageService.getSpecificMessageService(
            actorId.sub,
            conversationId,
            messageId
        );

        return res.status(200).json(result);
    }
}