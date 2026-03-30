import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {
    CreateConversationRequestUseCase
} from "../../application/conversation_requests/create_conversation_request_use_case";
import {RedisCacheService} from "../../../../container";


export class CreateConversationRequestService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async createConversationRequestService(actorId: string, conversationId: string, requestMessage: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationRepo = new ConversationRepositoryPg(client);
            const conversationRepoBans = new ConversationBansRepositoryPg(client);
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client);
            const conversationRequestMapper = new MapToRequestDto();


            const createConversationRequestUseCase = new CreateConversationRequestUseCase(
                userRepoReader,
                participantRepo,
                conversationRepo,
                conversationRepoBans,
                conversationRequestsRepo,
                conversationRequestMapper,
                RedisCacheService
            );

            return await createConversationRequestUseCase.createConversationRequestUseCase(
                actorId,
                conversationId,
                requestMessage
            );
        });

    }
}