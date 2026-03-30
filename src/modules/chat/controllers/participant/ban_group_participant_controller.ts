import {BanGroupParticipantService} from "../../transactional_services/participant/ban_group_participant_service";
import {Request, Response} from "express";
import {z} from "zod";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Server} from "socket.io";

export const BanGroupParticipantParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})

type BanGroupParticipantParamsSchemaType = z.infer<typeof BanGroupParticipantParamsSchema>;

export const BanGroupParticipantBodySchema = z.object({
    reason: z.string().min(1),
})

type BanGroupParticipantBodySchemaType = z.infer<typeof BanGroupParticipantBodySchema>;

export class BanGroupParticipantController {
    constructor(private readonly banGroupParticipantService: BanGroupParticipantService,
                private readonly extractUserId: ExtractActorId,
                private readonly io: Server) {}

    banGroupParticipantCont =
        async (req: Request<BanGroupParticipantParamsSchemaType,{},BanGroupParticipantBodySchemaType>, res: Response) => {
            const actorId = this.extractUserId.extractActorId(req);

            const {conversationId, targetId} = req.params;
            const {reason} = req.body;

            const result = await this.banGroupParticipantService.banGroupParticipantService(
                conversationId,
                targetId,
                actorId.sub,
                reason
            );

            this.io.to(conversationId).emit("participant:removed", {
                conversationId,
                userId: targetId
            });

            return res.status(200).json(result);
        }

}