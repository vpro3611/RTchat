import {GetSpecificParticipantService} from "../../transactional_services/participant/get_specific_participant_service";
import {Request, Response} from "express";
import {z} from "zod";
import {ExtractActorId} from "../../shared/extract_actor_id_req";

export const GetSpecificParticipantParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})

type GetSpecificParticipantSchemaType = z.infer<typeof GetSpecificParticipantParamsSchema>;

export class GetSpecificParticipantController {
    constructor(private readonly getSpecificParticipantService: GetSpecificParticipantService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getSpecificParticipantController = async (req: Request<GetSpecificParticipantSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId, targetId} = req.params;

        const result = await this.getSpecificParticipantService.getSpecificParticipantService(
            actorId.sub,
            conversationId,
            targetId
        )

        return res.status(200).json(result);
    }
}