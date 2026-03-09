import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {LeaveConversationUseCase} from "../../application/participant/leave_conversation_use_case";


export class LeaveConversationTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async leaveConversationTxService(actorId: string, conversationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);

            const leaveConversationUseCase = new LeaveConversationUseCase(participantRepo);

            return await leaveConversationUseCase.leaveConversationUseCase(actorId, conversationId);
        })
    }
}