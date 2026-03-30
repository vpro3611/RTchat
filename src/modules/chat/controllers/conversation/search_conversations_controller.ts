import {SearchConversationsService} from "../../transactional_services/conversation/search_conversations_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const SearchConversationsQuerySchema = z.object({
    query: z.string(),
    limit: z.coerce.number().optional(),
    cursor: z.string().optional(),
})


export class SearchConversationsController {
    constructor(private readonly searchConversationsService: SearchConversationsService,
                private readonly extractActorId: ExtractActorId
    ) {}


    searchConversationsCont = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {query, limit, cursor} = SearchConversationsQuerySchema.parse(req.query);

        const result = await this.searchConversationsService.searchConversationsService(
            actorId.sub,
            query,
            limit,
            cursor
        );

        return res.status(200).json(result);
    }
}