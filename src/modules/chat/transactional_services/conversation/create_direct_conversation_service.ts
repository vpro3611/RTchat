import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {CreateDirectConversationUseCase} from "../../application/conversation/create_direct_conversation_use_case";
import {RedisCacheService} from "../../../../container";
import {UserToUserBlocksPg} from "../../../users/repositories/user_to_user_blocks_pg";


export class CreateDirectConversationTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async createDirectConversationTxService(actorId: string, targetId: string) {
        return this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationMapper = new MapToConversationDto();
            const userToUserBansRepo = new UserToUserBlocksPg(client);

            const createDirectConversationUseCase = new CreateDirectConversationUseCase(
                conversationRepo,
                participantRepo,
                conversationMapper,
                RedisCacheService,
                userToUserBansRepo
            );

            return await createDirectConversationUseCase.createDirectConversationUseCase(actorId, targetId);
        });
    }
}