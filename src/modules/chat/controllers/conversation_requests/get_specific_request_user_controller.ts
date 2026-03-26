import {
    GetSpecificRequestUserService
} from "../../transactional_services/conversation_requests/get_specific_request_user_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetSpecificRequestUserParamsSchema = z.object({
    requestId: z.string().uuid(),
})

type GetSpecificRequestUserSchemaType = z.infer<typeof GetSpecificRequestUserParamsSchema>;

export class GetSpecificRequestUserController {
    constructor(private readonly getSpecificRequestService: GetSpecificRequestUserService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getSpecificRequestUserController =
        async (req: Request<GetSpecificRequestUserSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {requestId} = req.params;

            const result = await this.getSpecificRequestService.getSpecificRequestUserService(
                actorId.sub,
                requestId
            );

            return res.status(200).json(result);
    }
}