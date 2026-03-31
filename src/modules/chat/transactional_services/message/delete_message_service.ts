import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {FindMessageById} from "../../shared/find_message_by_id";
import {DeleteMessageUseCase} from "../../application/message/delete_message_use_case";
import {RedisCacheService} from "../../../../container";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";


export class DeleteMessageTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async deleteMessageTxService(actorId: string, conversationId: string, messageId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client);
            const messageMapper = new MapToMessage();
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationRepo = new ConversationRepositoryPg(client);
            const checkIsParticipant = new CheckIsParticipant(participantRepo);
            const findMessageById = new FindMessageById(messageRepo);

            const deleteMessageUseCase = new DeleteMessageUseCase(
                messageRepo,
                messageMapper,
                checkIsParticipant,
                findMessageById,
                RedisCacheService,
                conversationRepo
            );

            return await deleteMessageUseCase.deleteMessageUseCase(actorId, conversationId, messageId);
        })
    }
}