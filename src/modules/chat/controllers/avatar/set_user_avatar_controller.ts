import { Request, Response } from "express";
import { ExtractActorId } from "../../shared/extract_actor_id_req";
import { SetUserAvatarTxService } from "../../transactional_services/avatar/set_user_avatar_tx_service";

export class SetUserAvatarController {
    constructor(
        private readonly setUserAvatarService: SetUserAvatarTxService,
        private readonly extractActorId: ExtractActorId
    ) {}

    setAvatar = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        
        if (!req.file) {
            return res.status(400).json({ message: "Avatar file is required" });
        }

        const avatarId = await this.setUserAvatarService.setUserAvatar(
            actorId.sub,
            req.file.buffer
        );

        return res.status(201).json({ avatarId });
    }
}
