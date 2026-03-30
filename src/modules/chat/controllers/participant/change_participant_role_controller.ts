import {ChangeParticipantRoleTxService} from "../../transactional_services/participant/change_participant_role_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {Server} from "socket.io";

export const ChangeParticipantRoleParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})

type ChangeParticipantRoleSchemaType = z.infer<typeof ChangeParticipantRoleParamsSchema>;

export class ChangeParticipantRoleController {
    constructor(private readonly changeParticipantRoleService: ChangeParticipantRoleTxService,
                private readonly extractActorId: ExtractActorId,
                private readonly io: Server
    ) {}


    changeParticipantRoleCont = async (req: Request<ChangeParticipantRoleSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId, targetId} = req.params;

        const result = await this.changeParticipantRoleService.changeParticipantRoleTxService(
            actorId.sub,
            conversationId,
            targetId
        )

        this.io.to(conversationId).emit("participant:updated", {
            conversationId,
            participant: result
        });

        return res.status(200).json(result);
    }
}