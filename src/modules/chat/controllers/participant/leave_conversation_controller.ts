import {LeaveConversationTxService} from "../../transactional_services/participant/leave_conversation_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const LeaveConversationParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type LeaveConversationSchemaType = z.infer<typeof LeaveConversationParamsSchema>;

export class LeaveConversationController {
    constructor(private readonly leaveConversationService: LeaveConversationTxService,
                private readonly extractActorId: ExtractActorId
    ) {}


    leaveConversationCont = async (req: Request<LeaveConversationSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId} = req.params;

        await this.leaveConversationService.leaveConversationTxService(
            actorId.sub,
            conversationId
        )

        return res.status(204).send();
    }
}