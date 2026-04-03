import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {GetParticipantsUseCase} from "../../application/participant/get_participants_use_case";
import {RedisCacheService} from "../../../../container";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";


export class GetParticipantsTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async getParticipantsTxService(actorId: string, conversationId: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);

            const getParticipantsUseCase = new GetParticipantsUseCase(
                participantRepo,
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