import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserToUserBlocksPg} from "../repositories/user_to_user_blocks_pg";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserMapper} from "../shared/map_to_dto";
import {BlockSpecificUserUseCase} from "../application/block_specific_user_use_case";


export class BlockSpecificUserTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async blockSpecificUserTxService(actorId: string, targetId: string) {
        return await this.txManager.runInTransaction(async(client) => {
            const userToUserBlocksRepo = new UserToUserBlocksPg(client);
            const userRepoReader = new UserRepoReaderPg(client);
            const userMapper = new UserMapper();

            const blockSpecificUserUseCase = new BlockSpecificUserUseCase(
                userToUserBlocksRepo,
                userRepoReader,
                userMapper
            );

            return await blockSpecificUserUseCase.blockSpecificUserUseCase(
                actorId,
                targetId
            );
        })
    }
}