import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {MuteParticipantUseCase} from "../../application/participant/mute_participant_use_case";
import {MuteDuration} from "../../domain/participant/mute_duration";


export class MuteParticipantTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async muteParticipantTxService(actorId: string, targetId: string, conversationId: string, duration: MuteDuration) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const participantMapper = new MapToParticipantDto();

            const muteParticipantUseCase = new MuteParticipantUseCase(participantRepo, participantMapper);

            return await muteParticipantUseCase.muteParticipantUseCase(actorId, targetId, conversationId, duration)
        })
    }
}