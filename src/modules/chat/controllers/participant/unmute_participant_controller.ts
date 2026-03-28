import {UnmuteParticipantTxService} from "../../transactional_services/participant/unmute_participant_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {Server} from "socket.io";

export const UnmuteParticipantParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
});

type UnmuteParticipantSchemaType = z.infer<typeof UnmuteParticipantParamsSchema>;

export class UnmuteParticipantController {
    constructor(private readonly unmuteParticipantService: UnmuteParticipantTxService,
                private readonly extractUserId: ExtractActorId,
                private readonly io: Server
    ) {}

    unmuteParticipantCont = async (req: Request<UnmuteParticipantSchemaType>, res: Response)=> {
        const actorId = this.extractUserId.extractActorId(req);

        const {conversationId, targetId} = req.params;

        const result = await this.unmuteParticipantService.unmuteParticipantTxService(
            actorId.sub,
            targetId,
            conversationId
        );

        this.io.to(conversationId).emit("participant:updated", {
            conversationId,
            participant: result
        });

        return res.status(200).json(result);
    }
}