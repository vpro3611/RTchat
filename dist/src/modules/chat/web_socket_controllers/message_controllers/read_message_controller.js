"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkConversationAsReadController = exports.ReadMessageSchema = void 0;
const zod_1 = require("zod");
exports.ReadMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    messageId: zod_1.z.string().uuid(),
});
class MarkConversationAsReadController {
    markConversationReadTxService;
    constructor(markConversationReadTxService) {
        this.markConversationReadTxService = markConversationReadTxService;
    }
    readMessageController = async (socket, conversationId, messageId, io) => {
        const userId = socket.data.userId;
        await this.markConversationReadTxService.markConversationReadTxService(userId.sub, conversationId, messageId);
        io.to(conversationId).emit("message:read", {
            userId: userId.sub,
            conversationId: conversationId,
            messageId: messageId,
        });
    };
}
exports.MarkConversationAsReadController = MarkConversationAsReadController;
