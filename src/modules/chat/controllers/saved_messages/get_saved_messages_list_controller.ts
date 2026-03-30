import {GetSavedMessagesListService} from "../../transactional_services/saved_messages/get_saved_messages_list_service";
import {ExtractActorId} from "../../shared/extract_actor_id_req";
import {Request, Response} from "express";
import {z} from "zod";

const getSavedMessagesQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined))
        .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
            message: "limit must be a positive number",
        })
        .transform((val) => (val ? Math.min(val, 50) : 20)),

    cursor: z
        .string()
        .optional()
        .refine((val) => val === undefined || val.includes("|"), {
            message: "Invalid cursor format",
        }),
});

export class GetSavedMessagesListController {
    constructor(private readonly getSavedMessagesListService: GetSavedMessagesListService,
                private readonly extractActorId: ExtractActorId
    ) {}

    getSavedMessagesListCont = async (req: Request, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);

        const {limit, cursor} = getSavedMessagesQuerySchema.parse(req.query);

        const result =
            await this.getSavedMessagesListService
                .getSavedMessagesListService(
                    actorId.sub,
                    limit,
                    cursor
                );

        return res.status(200).json(result);
    }

}