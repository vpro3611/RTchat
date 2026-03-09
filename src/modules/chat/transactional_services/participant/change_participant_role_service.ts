import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {ChangeParticipantRoleUseCase} from "../../application/participant/change_participant_role_use_case";


export class ChangeParticipantRoleTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async changeParticipantRoleTxService(actorId: string, conversationId: string, targetId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const participantMapper = new MapToParticipantDto();

            const changeParticipantRoleUseCase = new ChangeParticipantRoleUseCase(participantRepo, participantMapper);

            return await changeParticipantRoleUseCase.changeParticipantRoleUseCase(actorId, conversationId, targetId);
        })
    }
}