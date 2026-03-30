"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSavedMessagesListController = void 0;
const zod_1 = require("zod");
const getSavedMessagesQuerySchema = zod_1.z.object({
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined))
        .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
        message: "limit must be a positive number",
    })
        .transform((val) => (val ? Math.min(val, 50) : 20)),
    cursor: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || val.includes("|"), {
        message: "Invalid cursor format",
    }),
});
class GetSavedMessagesListController {
    getSavedMessagesListService;
    extractActorId;
    constructor(getSavedMessagesListService, extractActorId) {
        this.getSavedMessagesListService = getSavedMessagesListService;
        this.extractActorId = extractActorId;
    }
    getSavedMessagesListCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { limit, cursor } = getSavedMessagesQuerySchema.parse(req.query);
        const result = await this.getSavedMessagesListService
            .getSavedMessagesListService(actorId.sub, limit, cursor);
        return res.status(200).json(result);
    };
}
exports.GetSavedMessagesListController = GetSavedMessagesListController;
