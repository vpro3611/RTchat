"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllRequestListController = exports.GetAllRequestListParamsSchema = exports.GetAllRequestListQuerySchema = void 0;
const zod_1 = require("zod");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
const ConversationReqStatusSchema = zod_1.z.enum([
    conversation_requests_1.ConversationRequestsStatus.ACCEPTED,
    conversation_requests_1.ConversationRequestsStatus.REJECTED,
    conversation_requests_1.ConversationRequestsStatus.EXPIRED,
    conversation_requests_1.ConversationRequestsStatus.CANCELLED,
    conversation_requests_1.ConversationRequestsStatus.PENDING,
    conversation_requests_1.ConversationRequestsStatus.WITHDRAWN,
]);
exports.GetAllRequestListQuerySchema = zod_1.z.object({
    status: ConversationReqStatusSchema.optional(),
});
exports.GetAllRequestListParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class GetAllRequestListController {
    getAllRequestListService;
    extractActorId;
    constructor(getAllRequestListService, extractActorId) {
        this.getAllRequestListService = getAllRequestListService;
        this.extractActorId = extractActorId;
    }
    getAllRequestListCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const { status } = exports.GetAllRequestListQuerySchema.parse(req.query);
        const result = await this.getAllRequestListService.getAllRequestListService(actorId.sub, conversationId, status);
        return res.status(200).json(result);
    };
}
exports.GetAllRequestListController = GetAllRequestListController;
