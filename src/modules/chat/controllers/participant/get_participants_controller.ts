import {GetParticipantsTxService} from "../../transactional_services/participant/get_participants_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetParticipantsParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type GetParticipantsSchemaType = z.infer<typeof GetParticipantsParamsSchema>;

export const GetParticipantsQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional(),
    cursor: z.string().optional(),
})

export class GetParticipantsController {
    constructor(private readonly getParticipantsService: GetParticipantsTxService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getParticipantsCont = async (req: Request<GetParticipantsSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId} = req.params;

        const {limit, cursor} = GetParticipantsQuerySchema.parse(req.query);

        const result = await this.getParticipantsService.getParticipantsTxService(
            actorId.sub,
            conversationId,
            limit,
            cursor
        );

        return res.status(200).json(result);
    }
}