"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUsersController = exports.SearchUsersQuerySchema = void 0;
const zod_1 = require("zod");
exports.SearchUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.string(),
    limit: zod_1.z.coerce.number().optional(),
    cursor: zod_1.z.string().optional(),
});
class SearchUsersController {
    searchUserService;
    extractUserIdFromReq;
    constructor(searchUserService, extractUserIdFromReq) {
        this.searchUserService = searchUserService;
        this.extractUserIdFromReq = extractUserIdFromReq;
    }
    searchUsersController = async (req, res) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);
        const { query, limit, cursor } = exports.SearchUsersQuerySchema.parse(req.query);
        const result = await this.searchUserService.searchUsersTxService(userId, query, limit, cursor);
        return res.status(200).json(result);
    };
}
exports.SearchUsersController = SearchUsersController;
