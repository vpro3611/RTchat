import {RemoveParticipantTxService} from "../../transactional_services/participant/remove_participant_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const RemoveParticipantParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})

type RemoveParticipantSchemaType = z.infer<typeof RemoveParticipantParamsSchema>;

export class RemoveParticipantController {
    constructor(private readonly removeParticipantService: RemoveParticipantTxService,
                private readonly extractActorId: ExtractActorId
    ) {}

    removeParticipantCont = async (req: Request<RemoveParticipantSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId, targetId} = req.params;

        const result = await this.removeParticipantService.removeParticipantTxService(
            actorId.sub,
            conversationId,
            targetId
        );

        return res.status(200).json(result);
    }

}