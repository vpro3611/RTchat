import {GetMessageTxService} from "../../transactional_services/message/get_messages_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetMessagesParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type GetMessagesSchemaType = z.infer<typeof GetMessagesParamsSchema>;

export const GetMessagesQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional(),
    cursor: z.string().optional(),
})


export class GetMessagesController {
    constructor(private readonly getMessagesService: GetMessageTxService,
                private readonly extractActorId: ExtractActorId
    ) {}


    getMessagesCont = async (req: Request<GetMessagesSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId} = req.params;

        const {limit, cursor} = GetMessagesQuerySchema.parse(req.query);

        const result = await this.getMessagesService.getMessagesTxService(
            actorId.sub,
            conversationId,
            limit,
            cursor
        );

        return res.status(200).json(result);
    }
}