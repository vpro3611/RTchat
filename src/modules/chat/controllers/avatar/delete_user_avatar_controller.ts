import { Request, Response } from "express";
import { ExtractActorId } from "../../shared/extract_actor_id_req";
import { DeleteUserAvatarTxService } from "../../transactional_services/avatar/delete_user_avatar_tx_service";

export class DeleteUserAvatarController {
    constructor(
        private readonly deleteUserAvatarService: DeleteUserAvatarTxService,
        private readonly extractActorId: ExtractActorId
    ) {}

    deleteAvatar = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        await this.deleteUserAvatarService.deleteUserAvatar(actorId.sub);

        return res.status(204).send();
    }
}
