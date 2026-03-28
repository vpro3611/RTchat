import {RemoveRequestService} from "../../transactional_services/conversation_requests/remove_request_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const RemoveRequestParamsSchema = z.object({
    requestId: z.string().uuid(),
})

type RemoveRequestSchemaType = z.infer<typeof RemoveRequestParamsSchema>;

export class RemoveRequestController {
    constructor(private readonly removeRequestService: RemoveRequestService,
                private readonly extractActorId: ExtractActorId
    ) {}

    removeRequestCont =
        async (req: Request<RemoveRequestSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {requestId} = req.params;

            await this.removeRequestService.removeRequestService(
                actorId.sub,
                requestId
            );

            return res.status(204).send();
        }
}