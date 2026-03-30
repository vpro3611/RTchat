import {SearchUsersTxService} from "../transactional_services/search_users_tx_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";
import {z} from "zod";

export const SearchUsersQuerySchema = z.object({
    query: z.string(),
    limit: z.coerce.number().optional(),
    cursor: z.string().optional(),
})

export class SearchUsersController {
    constructor(private readonly searchUserService: SearchUsersTxService,
                private readonly extractUserIdFromReq: ExtractUserIdFromReq
    ) {}

    searchUsersController = async (req: Request, res: Response) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);

        const {query, limit, cursor} = SearchUsersQuerySchema.parse(req.query);

        const result = await this.searchUserService.searchUsersTxService(
            userId,
            query,
            limit,
            cursor
        );

        return res.status(200).json(result);
    }
}