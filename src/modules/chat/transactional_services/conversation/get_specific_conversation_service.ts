import { TransactionManagerInterface } from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import { ConversationRepositoryPg } from "../../repositories_pg_realization/conversation_repository_pg";
import { ParticipantRepositoryPg } from "../../repositories_pg_realization/participant_repository_pg";
import { MapToConversationDto } from "../../shared/map_to_conversation_dto";
import { GetSpecificConversationUseCase } from "../../application/conversation/get_specific_conversation_use_case";
import { ConversationDTO } from "../../DTO/conversation_dto";

export class GetSpecificConversationTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async execute(actorId: string, conversationId: string): Promise<ConversationDTO> {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const mapper = new MapToConversationDto();

            const useCase = new GetSpecificConversationUseCase(
                conversationRepo,
                participantRepo,
                mapper
            );

            return await useCase.execute(actorId, conversationId);
        });
    }
}
