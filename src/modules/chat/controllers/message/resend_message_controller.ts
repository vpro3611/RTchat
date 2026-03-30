import {ResendMessageTxService} from "../../transactional_services/message/resend_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";
import {Server} from "socket.io";

export const ResendMessageParamsSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
});

export const ResendMessageBodySchema = z.object({
    targetConversationId: z.string().uuid(),
});

type ResendMessageParams = z.infer<typeof ResendMessageParamsSchema>;
type ResendMessageBody = z.infer<typeof ResendMessageBodySchema>;

export class ResendMessageController {
    constructor(
        private readonly resendMessageService: ResendMessageTxService,
        private readonly extractActorId: ExtractActorId,
        private readonly io: Server
    ) {}

    resendMessageCont = async (req: Request<ResendMessageParams, {}, ResendMessageBody>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const {conversationId, messageId} = req.params;
        const {targetConversationId} = req.body;

        const result = await this.resendMessageService.resendMessageTxService(
            actorId.sub,
            messageId,
            conversationId,
            targetConversationId
        );

        this.io.to(targetConversationId).emit("message:new", result);

        return res.status(201).json(result);
    }
}
