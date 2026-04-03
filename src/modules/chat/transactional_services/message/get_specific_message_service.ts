import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {FindMessageById} from "../../shared/find_message_by_id";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {GetSpecificMessageUseCase} from "../../application/message/get_specific_message_use_case";
import {RedisCacheService} from "../../../../container";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";


export class GetSpecificMessageService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async getSpecificMessageService(actorId: string, conversationId: string, messageId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client, this.encryptionService);
            const conversationRepo = new ConversationRepositoryPg(client, this.encryptionService);
            const messageMapper = new MapToMessage();
            const participantRepo = new ParticipantRepositoryPg(client);
            const findMessageById = new FindMessageById(messageRepo);

            const getSpecificMessageUseCase = new GetSpecificMessageUseCase(
                messageMapper,
                findMessageById,
                participantRepo,
                RedisCacheService,
                conversationRepo
            );

            return await getSpecificMessageUseCase.getSpecificMessageUseCase(actorId, conversationId, messageId);
        })
    }
}
