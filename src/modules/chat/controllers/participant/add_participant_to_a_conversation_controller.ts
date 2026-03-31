import {Request, Response} from "express";
import {z} from "zod";
import {
    AddParticipantToConversationTxService
} from "../../transactional_services/participant/add_participant_to_conversation_tx_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Server} from "socket.io";

export const AddParticipantToAConversationParamsSchema = z.object({
    conversationId: z.string().uuid(),
    targetId: z.string().uuid(),
})

type AddParticipantToAConversationSchemaType = z.infer<typeof AddParticipantToAConversationParamsSchema>;

export class AddParticipantToAConversationController {
    constructor(private readonly addParticipantService: AddParticipantToConversationTxService,
                private readonly extractActorId: ExtractActorId,
                private readonly io: Server
    ) {}
    addParticipantToAConversationCont =
        async (req: Request<AddParticipantToAConversationSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);

            const {conversationId, targetId} = req.params;

            const result = await this.addParticipantService.addParticipantToConversationTxService(
                actorId.sub,
                targetId,
                conversationId
            );

            this.io.to(conversationId).emit("participant:added", {
                conversationId,
                participant: result // ParticipantListDTO
            });

            // Notify new participant to refresh their conversation list
            this.io.to(`user:${targetId}`).emit("conversation:new", {
                conversationId,
                participant: result
            });

            return res.status(201).json(result);
    }
}