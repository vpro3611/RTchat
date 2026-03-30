import {UnbanGroupParticipantService} from "../../transactional_services/participant/unban_group_participant_service";
import {Request, Response} from "express";
import {z} from "zod";
import {ExtractActorId} from "../../shared/extract_actor_id_req";

export const UnbanGroupParticipantParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})

type UnbanGroupParticipantBodySchemaType = z.infer<typeof UnbanGroupParticipantParamsSchema>;

export class UnbanGroupParticipantController {
    constructor(private readonly unbanGroupParticipantService: UnbanGroupParticipantService,
                private readonly extractUserId: ExtractActorId) {}


    unbanGroupParticipantCont =
        async (req: Request<UnbanGroupParticipantBodySchemaType>, res: Response) => {
            const actorId = this.extractUserId.extractActorId(req);
            const {conversationId, targetId} = req.params;

            await this.unbanGroupParticipantService.unbanGroupParticipantService(
                actorId.sub,
                conversationId,
                targetId,
            );

            return res.status(204).send();

        }
}