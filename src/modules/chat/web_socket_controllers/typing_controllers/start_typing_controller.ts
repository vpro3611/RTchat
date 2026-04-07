import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";
import {Server} from "socket.io";

export const StartTypingSchema = z.object({
    conversationId: z.string().uuid(),
})

export class StartTypingController {

    startTypingController =
        async (
            socket: AuthSocket,
            conversationId: string,
            io: Server
        )=>
        {
            const userId = socket.data.userId;

            io.to(conversationId).emit("typing:start", {
                userId: userId.sub,
                conversationId: conversationId,
            });
    }
}