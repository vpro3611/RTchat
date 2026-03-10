import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {GetParticipantsUseCase} from "../../application/participant/get_participants_use_case";
import {RedisCacheService} from "../../../../container";


export class GetParticipantsTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async getParticipantsTxService(actorId: string, conversationId: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const participantMapper = new MapToParticipantDto();


            const getParticipantsUseCase = new GetParticipantsUseCase(
                participantRepo,
                participantMapper,
                RedisCacheService
            );

            return await getParticipantsUseCase.getParticipantsUseCase(
                actorId,
                conversationId,
                limit,
                cursor
            )
        })
    }
}