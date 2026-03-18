import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {GetSpecificUserUseCase} from "../application/get_specific_user_use_case";


export class GetSpecificUserTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getSpecificUserTxService(actorId: string, targetId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepoReaderPg(client);
            const userMapper = new UserMapper();
            const userLookup = new UserLookup(userRepo);

            const getSpecificUserUseCase = new GetSpecificUserUseCase(userLookup, userMapper);

            return await getSpecificUserUseCase.getSpecificUserUseCase(actorId, targetId);
        })
    }
}