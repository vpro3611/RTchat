import {
    GetSpecificRequestGroupService
} from "../../transactional_services/conversation_requests/get_specific_request_group_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetSpecificRequestGroupParamsSchema = z.object({
    conversationId: z.string().uuid(),
    requestId: z.string().uuid(),
})

type GetSpecificRequestGroupSchemaType = z.infer<typeof GetSpecificRequestGroupParamsSchema>;

export class GetSpecificRequestGroupController {
    constructor(private readonly getSpecificRequestGroupService: GetSpecificRequestGroupService,
                private readonly extractActorId: ExtractActorId
    ) {}


    getSpecificRequestGroupCont =
        async (req: Request<GetSpecificRequestGroupSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);

            const {conversationId, requestId} = req.params;

            const result = await this.getSpecificRequestGroupService.getSpecificRequestGroupService(
                actorId.sub,
                conversationId,
                requestId
            );

            return res.status(200).json(result)
    }
}