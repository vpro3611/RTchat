import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {Bcrypter} from "../../infrasctructure/ports/bcrypter/bcrypter";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {ChangePasswordUseCase} from "../application/change_password_use_case";


export class ChangePasswordTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async changePasswordTxService(actorId: string, oldPassword: string, newPassword: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);

            const bcrypter = new Bcrypter();
            const mapper = new UserMapper();
            const userLookup = new UserLookup(userRepoReader);


            const changePasswordUseCase = new ChangePasswordUseCase(userRepoReader, userRepoWriter, bcrypter, mapper, userLookup);

            return await changePasswordUseCase.changePasswordUseCase(actorId, oldPassword, newPassword);
        })
    }
}