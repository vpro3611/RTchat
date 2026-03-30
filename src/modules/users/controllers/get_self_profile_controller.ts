import {GetSelfProfileTxService} from "../transactional_services/get_self_profile_tx_service";
import {Request, Response} from "express";
import {ExtractActorId} from "../../chat/shared/extract_actor_id_req";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";

export class GetSelfProfileController {
    constructor(private readonly getSelfProfileService: GetSelfProfileTxService,
                private readonly extractUserId: ExtractUserIdFromReq
    ) {}

    getSelfProfileCont = async (req: Request, res: Response) => {
        const actorId = this.extractUserId.extractUserId(req);

        const result = await this.getSelfProfileService.getSelfProfileTxService(actorId);

        return res.status(200).json(result);
    }
}