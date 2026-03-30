import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserLookup} from "../shared/user_exists_by_id";
import {UserMapper} from "../shared/map_to_dto";
import {SearchUsersUseCase} from "../application/search_users_use_case";
import {RedisCacheService} from "../../../container";


export class SearchUsersTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async searchUsersTxService(actorId: string, query: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userLookup = new UserLookup(userRepoReader);

            const userMapper = new UserMapper();

            const searchUsersUseCase = new SearchUsersUseCase(
                userRepoReader,
                userLookup,
                userMapper,
                RedisCacheService
            );

            return await searchUsersUseCase.searchUsersUseCase(actorId, query, limit, cursor);
        })
    }
}