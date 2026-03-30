import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {GetSpecificParticipantUseCase} from "../../application/participant/get_specific_participant_use_case";
import {RedisCacheService} from "../../../../container";


export class GetSpecificParticipantService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getSpecificParticipantService(actorId: string, conversationId: string, targetId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);

            const getSpecificParticipantUseCase = new GetSpecificParticipantUseCase(participantRepo, RedisCacheService);

            return getSpecificParticipantUseCase.getSpecificParticipantUseCase(actorId, conversationId, targetId);
        })
    }
}