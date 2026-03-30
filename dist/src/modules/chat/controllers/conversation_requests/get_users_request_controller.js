"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersRequestController = exports.GetUsersRequestQuerySchema = void 0;
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
exports.GetUsersRequestQuerySchema = zod_1.z.object({
    status: ConversationReqStatusSchema.optional(),
});
class GetUsersRequestController {
    getUsersRequestService;
    extractActorId;
    constructor(getUsersRequestService, extractActorId) {
        this.getUsersRequestService = getUsersRequestService;
        this.extractActorId = extractActorId;
    }
    getUsersRequestCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { status } = exports.GetUsersRequestQuerySchema.parse(req.query);
        const result = await this.getUsersRequestService.getUsersRequestsService(actorId.sub, status);
        return res.status(200).json(result);
    };
}
exports.GetUsersRequestController = GetUsersRequestController;
