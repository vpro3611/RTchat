import {GetFullBlackListTxService} from "../transactional_services/get_full_black_list_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";

export class GetFullBlackListController {
    constructor(private readonly getFullBlackListService: GetFullBlackListTxService,
                private readonly extractUserId: ExtractUserIdFromReq
    ) {}

    getFullBlackListController = async (req: Request, res: Response) => {
        const userId = this.extractUserId.extractUserId(req);

        const result = await this.getFullBlackListService.getFullBlackListTxService(userId);

        return res.status(200).json(result);
    }
}