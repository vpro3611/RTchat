import {GetBannedUsersService} from "../../transactional_services/participant/get_banned_users_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

export const GetBannedUsersParamsSchema = z.object({
    conversationId: z.string().uuid(),
})

type GetBannedUsersSchemaType = z.infer<typeof GetBannedUsersParamsSchema>;

export class GetBannedUsersController {
    constructor(private readonly getBannedUsersService: GetBannedUsersService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getBannedUserCont =
        async (req: Request<GetBannedUsersSchemaType>, res: Response) => {
            const actorId = this.extractActorId.extractActorId(req);
            const {conversationId} = req.params;

            const result = await this.getBannedUsersService.getBannedUsersService(
                actorId.sub,
                conversationId
            );

            return res.status(200).json(result);
    }
}