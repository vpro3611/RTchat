import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {
    GetSpecificRequestGroupUseCase
} from "../../application/conversation_requests/get_specific_request_group_use_case";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {RedisCacheService} from "../../../../container";


export class GetSpecificRequestGroupService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getSpecificRequestGroupService(actorId: string, conversationId: string, requestId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const requestMapper = new MapToRequestDto();

            const getSpecificRequestGroupUseCase = new GetSpecificRequestGroupUseCase(
                participantRepo,
                conversationRequestsRepo,
                requestMapper,
                RedisCacheService
            );

            return await getSpecificRequestGroupUseCase.getSpecificRequestGroupUseCase(
                actorId,
                conversationId,
                requestId
            );
        })
    }
}