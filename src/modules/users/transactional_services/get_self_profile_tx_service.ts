import {TransactionManager} from "../../infrasctructure/ports/transaction_manager/transaction_manager";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserLookup} from "../shared/user_exists_by_id";
import {GetSelfProfileUseCase} from "../application/get_self_profile_use_case";


export class GetSelfProfileTxService {
    constructor(private readonly txManager: TransactionManager) {}

    async getSelfProfileTxService(actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepoReaderPg(client);
            const userLookup = new UserLookup(userRepo);

            const getSelfProfileUseCase = new GetSelfProfileUseCase(userLookup);

            return await getSelfProfileUseCase.getSelfProfileUseCase(actorId);
        })
    }
}