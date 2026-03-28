import { Request, Response } from "express";
import { ExtractActorId } from "../../shared/extract_actor_id_req";
import { SetConversationAvatarTxService } from "../../transactional_services/avatar/set_conversation_avatar_tx_service";
import { z } from "zod";
import { Server } from "socket.io";

export const SetConversationAvatarParamsSchema = z.object({
    conversationId: z.string().uuid(),
});

type SetConversationAvatarParamsSchemaType = z.infer<typeof SetConversationAvatarParamsSchema>;

export class SetConversationAvatarController {
    constructor(
        private readonly setConversationAvatarService: SetConversationAvatarTxService,
        private readonly extractActorId: ExtractActorId,
        private readonly io: Server
    ) {}

    setAvatar = async (req: Request<SetConversationAvatarParamsSchemaType>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const conversationId = req.params.conversationId;
        
        if (!req.file) {
            return res.status(400).json({ message: "Avatar file is required" });
        }

        const avatarId = await this.setConversationAvatarService.setConversationAvatar(
            conversationId,
            actorId.sub,
            req.file.buffer
        );

        this.io.to(conversationId).emit("conversation:updated", {
            conversationId,
            conversation: { avatarId } // На фронте Store.updateChatAvatar обновит только это поле
        });

        return res.status(201).json({ avatarId });
    }
}
