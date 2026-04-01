import {LeaveConversationTxService} from "../../transactional_services/participant/leave_conversation_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {Server} from "socket.io";
import {GetSpecificParticipantService} from "../../transactional_services/participant/get_specific_participant_service";

export const LeaveConversationParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type LeaveConversationSchemaType = z.infer<typeof LeaveConversationParamsSchema>;

export class LeaveConversationController {
    constructor(private readonly leaveConversationService: LeaveConversationTxService,
                private readonly getSpecificParticipantService: GetSpecificParticipantService,
                private readonly extractActorId: ExtractActorId,
                private readonly io: Server
    ) {}


    leaveConversationCont = async (req: Request<LeaveConversationSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId} = req.params;

        const newOwnerId = await this.leaveConversationService.leaveConversationTxService(
            actorId.sub,
            conversationId
        )

        // Notify other participants that user left
        this.io.to(conversationId).emit("participant:removed", {
            conversationId,
            userId: actorId.sub
        });

        // Notify if ownership was transferred
        if (newOwnerId) {
            const result = await this.getSpecificParticipantService.getSpecificParticipantService(
                newOwnerId,
                conversationId,
                newOwnerId
            );

            this.io.to(conversationId).emit("participant:updated", {
                conversationId,
                participant: result.participant
            });
        }

        return res.status(204).send();
    }
}