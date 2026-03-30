import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {ChangeUsernameUseCase} from "../application/change_username_use_case";


export class ChangeUsernameTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async changeUsernameTxService(actorId: string, newUsername: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);

            const mapper = new UserMapper();
            const userLookup = new UserLookup(userRepoReader);

            const changeUsernameUseCase = new ChangeUsernameUseCase(userRepoReader, userRepoWriter, mapper, userLookup);

            return await changeUsernameUseCase.changeUsernameUseCase(actorId, newUsername);
        })
    }
}