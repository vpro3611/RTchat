import { Request, Response } from "express";
import { ExtractActorId } from "../../shared/extract_actor_id_req";
import { GetSpecificConversationTxService } from "../../transactional_services/conversation/get_specific_conversation_service";
import { z } from "zod";

export const GetSpecificConversationParamsSchema = z.object({
    conversationId: z.string().uuid(),
});

type GetSpecificConversationParams = z.infer<typeof GetSpecificConversationParamsSchema>;

export class GetSpecificConversationController {
    constructor(
        private readonly getSpecificConversationService: GetSpecificConversationTxService,
        private readonly extractActorId: ExtractActorId
    ) {}

    execute = async (req: Request<GetSpecificConversationParams>, res: Response) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;

        const result = await this.getSpecificConversationService.execute(
            actorId.sub,
            conversationId
        );

        return res.status(200).json(result);
    }
}
