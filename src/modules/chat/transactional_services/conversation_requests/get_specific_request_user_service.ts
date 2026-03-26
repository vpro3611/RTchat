import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {
    GetSpecificRequestUserUseCase
} from "../../application/conversation_requests/get_specific_request_user_use_case";
import {RedisCacheService} from "../../../../container";


export class GetSpecificRequestUserService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getSpecificRequestUserService(actorId: string, requestId: string) {
       return await this.txManager.runInTransaction(async (client) => {
           const userRepoReader = new UserRepoReaderPg(client);
           const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client);
           const requestMapper = new MapToRequestDto();

           const getSpecificRequestUserUseCase = new GetSpecificRequestUserUseCase(
               conversationRequestsRepo,
               userRepoReader,
               requestMapper,
               RedisCacheService
           );

           return await getSpecificRequestUserUseCase.getSpecificRequestUserUseCase(
               actorId,
               requestId
           );
       })
    }
}