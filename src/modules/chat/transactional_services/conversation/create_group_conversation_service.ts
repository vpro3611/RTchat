import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {CreateGroupConversationUseCase} from "../../application/conversation/create_group_conversation_use_case";
import {RedisCacheService} from "../../../../container";
import { EncryptionPort } from "../../../infrasctructure/ports/encryption/encryption_port";


export class CreateGroupConversationTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}


    async createGroupConversationTxService(title: string, actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client, this.encryptionService);
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationMapper = new MapToConversationDto();

            const createGroupConversationUseCase = new CreateGroupConversationUseCase(
                conversationRepo,
                participantRepo,
                conversationMapper,
                RedisCacheService
            );

            return await createGroupConversationUseCase.createGroupConversationUseCase(title, actorId);
        })
    }
}