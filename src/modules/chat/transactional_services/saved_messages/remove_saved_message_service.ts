import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {SavedMessagesRepoPg} from "../../repositories_pg_realization/saved_messages_repo_pg";
import {RemoveSavedMessageUseCase} from "../../application/saved_messages/remove_saved_message_use_case";
import {RedisCacheService} from "../../../../container";


export class RemoveSavedMessageService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async removeSavedMessageService(actorId: string, messageId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const savedMessageRepo = new SavedMessagesRepoPg(client);

            const removeSavedMessageUseCase = new RemoveSavedMessageUseCase(
                userRepoReader,
                savedMessageRepo,
                RedisCacheService
            );

            return await removeSavedMessageUseCase
                .removeSavedMessageUseCase(actorId, messageId);
        })

    }
}