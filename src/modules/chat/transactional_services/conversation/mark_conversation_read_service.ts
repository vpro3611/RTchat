import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MarkConversationReadUseCase} from "../../application/conversation/mark_conversation_read_use_case";


export class MarkConversationReadTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async markConversationReadTxService(actorId: string, conversationId: string, messageId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);

            const markConversationReadUseCase = new MarkConversationReadUseCase(conversationRepo, participantRepo);

            return await markConversationReadUseCase.markConversationReadUseCase(actorId, conversationId, messageId);
        })
    }
}