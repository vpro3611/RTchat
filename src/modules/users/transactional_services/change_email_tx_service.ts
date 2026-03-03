import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {ChangeEmailUseCase} from "../application/change_email_use_case";


export class ChangeEmailTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async changeEmailTxService(actorId: string, newEmail: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);

            const mapper = new UserMapper();
            const userLookup = new UserLookup(userRepoReader);


            const changeEmailUseCase = new ChangeEmailUseCase(userRepoReader, userRepoWriter, mapper, userLookup);

            return await changeEmailUseCase.changeEmailUseCase(actorId, newEmail);
        })
    }
}