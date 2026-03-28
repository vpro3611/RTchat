import { Request, Response } from "express";
import { ExtractActorId } from "../../shared/extract_actor_id_req";
import { DeleteConversationAvatarTxService } from "../../transactional_services/avatar/delete_conversation_avatar_tx_service";
import { z } from "zod";
import { Server } from "socket.io";

export const DeleteConversationAvatarParamsSchema = z.object({
    conversationId: z.string().uuid(),
});

type DeleteConversationAvatarParamsSchemaType = z.infer<typeof DeleteConversationAvatarParamsSchema>;

export class DeleteConversationAvatarController {
    constructor(
        private readonly deleteConversationAvatarService: DeleteConversationAvatarTxService,
        private readonly extractActorId: ExtractActorId,
        private readonly io: Server
    ) {}

    deleteAvatar = async (req: Request<DeleteConversationAvatarParamsSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const conversationId = req.params.conversationId;

        await this.deleteConversationAvatarService.deleteConversationAvatar(
            conversationId,
            actorId.sub
        );

        this.io.to(conversationId).emit("conversation:updated", {
            conversationId,
            conversation: { avatarId: null }
        });

        return res.status(204).send();
    }
}
