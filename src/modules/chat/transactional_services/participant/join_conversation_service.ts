import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {JoinConversationUseCase} from "../../application/participant/join_conversation_use_case";
import {RedisCacheService} from "../../../../container";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {
    ConversationRequestsRepositoryPg
} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {MapToRequestDto} from "../../shared/map_to_request_dto";


export class JoinConversationTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async joinConversationTxService(actorId: string, conversationId: string,) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client);
            const requestMapper = new MapToRequestDto();

            const joinConversationUseCase = new JoinConversationUseCase(
                conversationRepo,
                participantRepo,
                RedisCacheService,
                conversationBansRepo,
                conversationRequestsRepo,
                requestMapper
            );

            return await joinConversationUseCase.joinConversationUseCase(actorId, conversationId)
        })
    }
}