import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";
import {Server} from "socket.io";

export const StartTypingSchema = z.object({
    conversationId: z.string().uuid(),
})

export class StartTypingController {

    constructor(private io: Server) {}

    startTypingController = async (socket: AuthSocket, conversationId: string)=>  {
        const userId = socket.data.userId;

        this.io.to(conversationId).emit("typing:started", {
            userId: userId.sub,
            conversationId: conversationId,
        });
    }
}