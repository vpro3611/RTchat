import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {GetBannedUsersUseCase} from "../../application/participant/get_banned_users_use_case";
import {RedisCacheService} from "../../../../container";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";


export class GetBannedUsersService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}


    async getBannedUsersService(actorId: string, conversationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);

            const getBannedUsersUseCase = new GetBannedUsersUseCase(
                participantRepo,
                conversationBansRepo,
                RedisCacheService
            );

            return await getBannedUsersUseCase.getBannedUsersUseCase(
                conversationId,
                actorId
            );
        })
    }
}