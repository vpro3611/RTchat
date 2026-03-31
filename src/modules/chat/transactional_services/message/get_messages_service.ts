import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {GetMessagesUseCase} from "../../application/message/get_messages_use_case";
import {RedisCacheService} from "../../../../container";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";


export class GetMessageTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async getMessagesTxService(actorId: string, conversationId: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client);
            const conversationRepo = new ConversationRepositoryPg(client);
            const messageMapper = new MapToMessage();
            const participantRepo = new ParticipantRepositoryPg(client);

            const getMessagesUseCase = new GetMessagesUseCase(
                messageRepo,
                messageMapper,
                RedisCacheService,
                participantRepo,
                conversationRepo
            );

            return await getMessagesUseCase.getMessagesUseCase(actorId, conversationId, limit, cursor);
        })
    }
}
