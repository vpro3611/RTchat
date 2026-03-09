import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {UnmuteParticipantUseCase} from "../../application/participant/unmute_participant_use_case";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";


export class UnmuteParticipantTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async unmuteParticipantTxService(actorId: string, targetId: string, conversationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const participantMapper = new MapToParticipantDto();

            const unmuteParticipantUseCase = new UnmuteParticipantUseCase(participantRepo, participantMapper);

            return await unmuteParticipantUseCase.unmuteParticipantUseCase(actorId, targetId, conversationId);
        })
    }
}