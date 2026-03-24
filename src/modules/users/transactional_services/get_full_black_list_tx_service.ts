import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserLookup} from "../shared/user_exists_by_id";
import {UserToUserBlocksPg} from "../repositories/user_to_user_blocks_pg";
import {UserMapper} from "../shared/map_to_dto";
import {GetFullBlackListUseCase} from "../application/get_full_black_list_use_case";


export class GetFullBlackListTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getFullBlackListTxService(actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userLookup = new UserLookup(userRepoReader);

            const userToUserBlocksRepo = new UserToUserBlocksPg(client);
            const userMapper = new UserMapper();

            const getFullBlackListUseCase = new GetFullBlackListUseCase(
                userToUserBlocksRepo,
                userLookup,
                userMapper
            );

            return await getFullBlackListUseCase.getFullBlackListUseCase(
                actorId
            )
        })
    }
}