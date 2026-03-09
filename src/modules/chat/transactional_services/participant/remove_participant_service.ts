import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {RemoveParticipantUseCase} from "../../application/participant/remove_participant_use_case";
import {RedisCacheService} from "../../../../container";


export class RemoveParticipantTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async removeParticipantTxService(actorId: string, conversationId: string, targetId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);

            const removeParticipantUseCase = new RemoveParticipantUseCase(
                participantRepo,
                RedisCacheService
            );

            return await removeParticipantUseCase.removeParticipantUseCase(actorId, conversationId, targetId);
        })
    }
}