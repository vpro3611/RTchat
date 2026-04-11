import { TransactionManagerInterface } from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import { EncryptionPort } from "../../../infrasctructure/ports/encryption/encryption_port";
import { ConversationRequestsRepositoryPg } from "../../repositories_pg_realization/conversation_requests_repository_pg";

export class ExpireJoinRequestsTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async run(): Promise<number> {
        return await this.txManager.runInTransaction(async (client) => {
            const repo = new ConversationRequestsRepositoryPg(client, this.encryptionService);
            return await repo.expireRequests();
        });
    }
}
