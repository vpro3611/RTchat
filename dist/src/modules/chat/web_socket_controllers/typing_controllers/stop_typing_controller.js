"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopTypingController = exports.StopTypingSchema = void 0;
const zod_1 = require("zod");
exports.StopTypingSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class StopTypingController {
    stopTypingController = async (socket, conversationId, io) => {
        const userId = socket.data.userId;
        io.to(conversationId).emit("typing:stopped", {
            userId: userId.sub,
            conversationId: conversationId,
        });
    };
}
exports.StopTypingController = StopTypingController;
