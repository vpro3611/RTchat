import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationReqStatus} from "../../domain/conversation_requests/conversation_requests";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {GetUsersRequestsUseCase} from "../../application/conversation_requests/get_users_requests_use_case";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {RedisCacheService} from "../../../../container";


export class GetUsersRequestsService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async getUsersRequestsService(actorId: string, status?: ConversationReqStatus) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client);
            const userRepoReader = new UserRepoReaderPg(client);
            const requestMapper = new MapToRequestDto();

            const getUsersRequestsUseCase = new GetUsersRequestsUseCase(
                userRepoReader,
                conversationRequestsRepo,
                requestMapper,
                RedisCacheService
            );

            return await getUsersRequestsUseCase.getUsersRequestsUseCase(actorId, status);
        })
    }
}