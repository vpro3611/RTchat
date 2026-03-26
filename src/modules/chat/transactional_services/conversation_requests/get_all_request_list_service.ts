import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {GetAllRequestListUseCase} from "../../application/conversation_requests/get_all_requst_list_use_case";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {ConversationReqStatus} from "../../domain/conversation_requests/conversation_requests";
import {RedisCacheService} from "../../../../container";


export class GetAllRequestListService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async getAllRequestListService(actorId: string, conversationId: string, status?: ConversationReqStatus) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const requestMapper = new MapToRequestDto();

            const getAllRequestListUseCase = new GetAllRequestListUseCase(
                participantRepo,
                conversationRequestsRepo,
                requestMapper,
                RedisCacheService
            );

            return await getAllRequestListUseCase.getAllRequestsListUseCase(
                actorId,
                conversationId,
                status
            );
        })
    }
}