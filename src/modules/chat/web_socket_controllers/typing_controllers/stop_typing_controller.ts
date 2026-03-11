import {Server} from "socket.io";
import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";

export const StopTypingSchema = z.object({
    conversationId: z.string().uuid(),
});


export class StopTypingController {
    constructor(private readonly io: Server) {}


    stopTypingController = async (socket: AuthSocket, conversationId: string) => {
        const userId = socket.data.userId;

        this.io.to(conversationId).emit("typing:stopped", {
            userId: userId.sub,
            conversationId: conversationId,
        });
    }
}