import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {JoinConversationUseCase} from "../../application/participant/join_conversation_use_case";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {RedisCacheService} from "../../../../container";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";


export class JoinConversationTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async joinConversationTxService(actorId: string, conversationId: string,) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantMapper = new MapToParticipantDto();
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);

            const joinConversationUseCase = new JoinConversationUseCase(
                conversationRepo,
                participantRepo,
                participantMapper,
                RedisCacheService,
                conversationBansRepo
            );

            return await joinConversationUseCase.joinConversationUseCase(actorId, conversationId)
        })
    }
}