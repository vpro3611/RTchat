import {Server} from "socket.io";
import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";

export const StopTypingSchema = z.object({
    conversationId: z.string().uuid(),
});


export class StopTypingController {


    stopTypingController =
        async (
            socket: AuthSocket,
            conversationId: string,
            io: Server
        ) =>
        {
            const userId = socket.data.userId;

            io.to(conversationId).emit("typing:stop", {
                userId: userId.sub,
                conversationId: conversationId,
            });
    }
}