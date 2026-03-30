import {MuteParticipantTxService} from "../../transactional_services/participant/mute_participant_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {MuteDuration} from "../../domain/participant/mute_duration";
import {Server} from "socket.io";

export const MuteParticipantParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})
type MuteParticipantSchemaType = z.infer<typeof MuteParticipantParamsSchema>;


const MuteDurationSchema = z.enum(
    Object.values(MuteDuration) as [MuteDuration, ...MuteDuration[]]
)

export const MuteParticipantBodySchema = z.object({
    duration: MuteDurationSchema,
})

type MuteDurationSchemaType = z.infer<typeof MuteParticipantBodySchema>;


export class MuteParticipantController {
    constructor(private readonly muteParticipantService: MuteParticipantTxService,
                private readonly extractActorId: ExtractActorId,
                private readonly io: Server
    ) {}


    muteParticipantCont =
        async (req: Request<MuteParticipantSchemaType, {}, MuteDurationSchemaType>, res: Response) =>
        {
            const actorId = this.extractActorId.extractActorId(req);

            const {conversationId, targetId} = req.params;

            const {duration} = req.body;

            const result = await this.muteParticipantService.muteParticipantTxService(
                actorId.sub,
                targetId,
                conversationId,
                duration
            );

            this.io.to(conversationId).emit("participant:updated", {
                conversationId,
                participant: result
            });

            return res.status(200).json(result);
        }
}