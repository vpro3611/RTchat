"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeConversationRequestStatusController = exports.ChangeRequestStatusParamsSchema = exports.ChangeRequestStatusBodySchema = void 0;
const zod_1 = require("zod");
const conversation_requests_1 = require("../../domain/conversation_requests/conversation_requests");
const ConversationReqStatusSchema = zod_1.z.enum([
    conversation_requests_1.ConversationRequestsStatus.ACCEPTED,
    conversation_requests_1.ConversationRequestsStatus.REJECTED,
    conversation_requests_1.ConversationRequestsStatus.EXPIRED,
    conversation_requests_1.ConversationRequestsStatus.CANCELLED,
]);
exports.ChangeRequestStatusBodySchema = zod_1.z.object({
    status: ConversationReqStatusSchema,
    reviewMessage: zod_1.z.string().min(1),
});
exports.ChangeRequestStatusParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    requestId: zod_1.z.string().uuid(),
});
class ChangeConversationRequestStatusController {
    changeConversationRequestStatusService;
    extractActorId;
    constructor(changeConversationRequestStatusService, extractActorId) {
        this.changeConversationRequestStatusService = changeConversationRequestStatusService;
        this.extractActorId = extractActorId;
    }
    changeConversationRequestStatusCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, requestId } = req.params;
        const { status, reviewMessage } = req.body;
        const result = await this.changeConversationRequestStatusService.changeRequestStatusService(actorId.sub, conversationId, requestId, reviewMessage, status);
        return res.status(200).json(result);
    };
}
exports.ChangeConversationRequestStatusController = ChangeConversationRequestStatusController;
