import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {BanGroupParticipantUseCase} from "../../application/participant/ban_group_participant_use_case";
import {RedisCacheService} from "../../../../container";
import {ConversationBansDTO} from "../../DTO/bans_dto";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";


export class BanGroupParticipantService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}


    async banGroupParticipantService(
        conversationId: string,
        targetId: string,
        actorId: string,
        reason: string
    ): Promise<ConversationBansDTO> {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);

            const banGroupParticipantUseCase = new BanGroupParticipantUseCase(
                participantRepo,
                conversationBansRepo,
                RedisCacheService
            );

            return await banGroupParticipantUseCase.banGroupParticipantUseCase({
                    conversationId: conversationId,
                    userId: targetId,
                    bannedBy: actorId,
                    reason: reason
            });
        })
    }
}