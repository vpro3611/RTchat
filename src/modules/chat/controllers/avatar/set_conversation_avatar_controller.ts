import { Request, Response } from "express";
import { ExtractActorId } from "../../shared/extract_actor_id_req";
import { SetConversationAvatarTxService } from "../../transactional_services/avatar/set_conversation_avatar_tx_service";
import { z } from "zod";

export const SetConversationAvatarParamsSchema = z.object({
    conversationId: z.string().uuid(),
});

type SetConversationAvatarParamsSchemaType = z.infer<typeof SetConversationAvatarParamsSchema>;

export class SetConversationAvatarController {
    constructor(
        private readonly setConversationAvatarService: SetConversationAvatarTxService,
        private readonly extractActorId: ExtractActorId
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

        return res.status(201).json({ avatarId });
    }
}
