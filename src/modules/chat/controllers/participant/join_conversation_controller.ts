import {JoinConversationTxService} from "../../transactional_services/participant/join_conversation_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {Server} from "socket.io";

export const JoinConversationParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type JoinConversationSchemaType = z.infer<typeof JoinConversationParamsSchema>;

export class JoinConversationController {
    constructor(private readonly joinConversationService: JoinConversationTxService,
                private readonly extractActorId: ExtractActorId,
                private readonly io: Server
    ) {}


    joinConversationCont = async (req: Request<JoinConversationSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {conversationId} = req.params;

        const result = await this.joinConversationService.joinConversationTxService(
            actorId.sub,
            conversationId
        );

        // Notify admins/owner about new join request
        this.io.to(conversationId).emit("conversation:request_new", {
            conversationId,
            request: result
        });

        return res.status(200).json(result);
    }
}