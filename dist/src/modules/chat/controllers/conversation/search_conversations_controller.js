"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchConversationsController = exports.SearchConversationsQuerySchema = void 0;
const zod_1 = require("zod");
exports.SearchConversationsQuerySchema = zod_1.z.object({
    query: zod_1.z.string(),
    limit: zod_1.z.coerce.number().optional(),
    cursor: zod_1.z.string().optional(),
});
class SearchConversationsController {
    searchConversationsService;
    extractActorId;
    constructor(searchConversationsService, extractActorId) {
        this.searchConversationsService = searchConversationsService;
        this.extractActorId = extractActorId;
    }
    searchConversationsCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { query, limit, cursor } = exports.SearchConversationsQuerySchema.parse(req.query);
        const result = await this.searchConversationsService.searchConversationsService(actorId.sub, query, limit, cursor);
        return res.status(200).json(result);
    };
}
exports.SearchConversationsController = SearchConversationsController;
