import {EditMessageTxService} from "../transactional_services/message/edit_message_service";
import {Server} from "socket.io";
import {AuthSocket} from "../web_socket/chat_gateway_types";
import {z} from "zod";

export const EditMessageSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
    newContent: z.string(),
})

export class EditMessageController {
    constructor(private readonly editMessageService: EditMessageTxService,
                private readonly io: Server
    ) {}

    editMessageController = async (
        socket: AuthSocket,
        conversationId: string,
        messageId: string,
        newContent: string
    ) => {
        const userId = socket.data.userId;

        const message = await this.editMessageService.editMessageTxService(
            userId.sub,
            conversationId,
            messageId,
            newContent
        );

        this.io.to(conversationId).emit("message:edited", {
           message: message
        });
    }
}