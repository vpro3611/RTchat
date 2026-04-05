import {Request, Response} from "express";
import {ReplyToMessageTxService} from "../../transactional_services/message/reply_to_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {FileDTO} from "../../DTO/file_dto";
import {Server} from "socket.io";

export class ReplyToMessageRestController {
    constructor(
        private readonly replyToMessageService: ReplyToMessageTxService,
        private readonly extractActorId: ExtractActorId,
        private readonly io: Server
    ) {}

    replyToMessage = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const conversationId = req.params.conversationId as string;
        const {parentMessageId, content} = req.body;
        const files = req.files as Express.Multer.File[];

        const fileDTOs: FileDTO[] = files?.map(file => ({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        })) || [];

        const message = await this.replyToMessageService.replyToMessageTxService(
            actorId.sub,
            conversationId,
            parentMessageId,
            content,
            fileDTOs
        );

        this.io.to(conversationId).emit("message:new", message);

        res.status(201).json(message);
    }
}
