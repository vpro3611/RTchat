import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {UserLookup} from "../shared/user_exists_by_id";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserMapper} from "../shared/map_to_dto";
import {ToggleIsActiveUseCase} from "../application/toggle_status_use_case_to_false";


export class ToggleStatusTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async toggleStatusTxService(actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoWriter = new UserRepoWriterPg(client);
            const userRepoReader = new UserRepoReaderPg(client);
            const userLookup = new UserLookup(userRepoReader);
            const mapper = new UserMapper();

            const toggleStatusUseCase = new ToggleIsActiveUseCase(userRepoWriter, mapper, userLookup);

            return await toggleStatusUseCase.toggleIsActiveUseCase(actorId);
        })
    }
}