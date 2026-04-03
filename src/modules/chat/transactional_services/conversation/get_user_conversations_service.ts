import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {GetUserConversationsUseCase} from "../../application/conversation/get_user_conversations_use_case";
import {RedisCacheService} from "../../../../container";
import { EncryptionPort } from "../../../infrasctructure/ports/encryption/encryption_port";


export class GetUserConversationsTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async getUserConversationTxService(actorId: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client, this.encryptionService);
            const conversationMapper = new MapToConversationDto();

            const getUserConversationsUseCase = new GetUserConversationsUseCase(
                conversationRepo,
                conversationMapper,
                RedisCacheService
            );

            return await getUserConversationsUseCase.getUserConversationsUseCase(actorId, limit, cursor);
        });
    }
}