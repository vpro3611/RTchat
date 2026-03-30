"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawConversationRequestController = exports.WithdrawConversationRequestParamsSchema = void 0;
const zod_1 = require("zod");
exports.WithdrawConversationRequestParamsSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
});
class WithdrawConversationRequestController {
    withdrawConversationRequestService;
    extractActorId;
    constructor(withdrawConversationRequestService, extractActorId) {
        this.withdrawConversationRequestService = withdrawConversationRequestService;
        this.extractActorId = extractActorId;
    }
    withdrawConversationRequestCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { requestId } = req.params;
        const result = await this.withdrawConversationRequestService.withdrawRequestService(actorId.sub, requestId);
        return res.status(200).json(result);
    };
}
exports.WithdrawConversationRequestController = WithdrawConversationRequestController;
