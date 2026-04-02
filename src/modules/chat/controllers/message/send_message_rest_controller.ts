import {Request, Response} from "express";
import {SendMessageTxService} from "../../transactional_services/message/send_message_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {FileDTO} from "../../DTO/file_dto";
import {Server} from "socket.io";

export class SendMessageRestController {
    constructor(
        private readonly sendMessageService: SendMessageTxService,
        private readonly extractActorId: ExtractActorId,
        private readonly io: Server
    ) {}

    sendMessage = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const conversationId = req.params.conversationId as string;
        const {content} = req.body;
        const files = req.files as Express.Multer.File[];

        const fileDTOs: FileDTO[] = files?.map(file => ({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        })) || [];

        const message = await this.sendMessageService.sendMessageTxService(
            actorId.sub,
            conversationId,
            content,
            fileDTOs
        );

        this.io.to(conversationId).emit("message:new", message);

        res.status(201).json(message);
    }
}
