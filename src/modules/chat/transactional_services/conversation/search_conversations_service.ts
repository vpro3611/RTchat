import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {UserLookup} from "../../../users/shared/user_exists_by_id";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {SearchConversationUseCase} from "../../application/conversation/search_conversations_use_case";
import {RedisCacheService} from "../../../../container";
import { EncryptionPort } from "../../../infrasctructure/ports/encryption/encryption_port";


export class SearchConversationsService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async searchConversationsService(actorId: string, query: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepoReaderPg(client);
            const userLookup = new UserLookup(userRepo);

            const conversationRepo = new ConversationRepositoryPg(client, this.encryptionService);
            const conversationMapper = new MapToConversationDto();

            const searchConversationUseCase = new SearchConversationUseCase(
                conversationRepo,
                userLookup,
                conversationMapper,
                RedisCacheService
            );

            return await searchConversationUseCase.searchConversationUseCase(
                actorId,
                query,
                limit,
                cursor
            );
        })
    }
}