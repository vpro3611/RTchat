import {ToggleStatusTxService} from "../transactional_services/toggle_status_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";


export class ToggleStatusController {
    constructor(private readonly toggleStatusService: ToggleStatusTxService,
                private readonly extractUserIdFromReq: ExtractUserIdFromReq
    ) {}

    toggleStatusController = async (req: Request, res: Response) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);

        const result = await this.toggleStatusService.toggleStatusTxService(userId);

        return res.status(200).json(result);
    }
}