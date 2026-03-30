"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditMessageController = exports.EditMessageSchema = void 0;
const zod_1 = require("zod");
exports.EditMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    messageId: zod_1.z.string().uuid(),
    newContent: zod_1.z.string(),
});
class EditMessageController {
    editMessageService;
    constructor(editMessageService) {
        this.editMessageService = editMessageService;
    }
    editMessageController = async (socket, conversationId, messageId, newContent, io) => {
        const userId = socket.data.userId;
        const message = await this.editMessageService.editMessageTxService(userId.sub, conversationId, messageId, newContent);
        io.to(conversationId).emit("message:edited", {
            message: message
        });
    };
}
exports.EditMessageController = EditMessageController;
