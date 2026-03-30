import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {UnbanGroupParticipantUseCase} from "../../application/participant/unban_group_participant_use_case";
import {RedisCacheService} from "../../../../container";


export class UnbanGroupParticipantService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async unbanGroupParticipantService(actorId: string, conversationId: string, targetId: string) {
        return this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);

            const unbanGroupParticipantUseCase = new UnbanGroupParticipantUseCase(
                participantRepo,
                conversationBansRepo,
                RedisCacheService
            );

            return await unbanGroupParticipantUseCase.unbanGroupParticipantUseCase(
                conversationId,
                actorId,
                targetId
            );
        })
    }
}