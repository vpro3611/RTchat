import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {ChangeRequestStatusUseCase} from "../../application/conversation_requests/change_request_status_use_case";
import {ConversationReqStatus} from "../../domain/conversation_requests/conversation_requests";
import {RedisCacheService} from "../../../../container";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";


export class ChangeRequestStatusService {
    constructor(private readonly txManager: TransactionManagerInterface, private readonly encryptionService: EncryptionPort) {}


    async changeRequestStatusService(
        actorId: string,
        conversationId: string,
        requestId: string,
        reviewMessage: string,
        status: ConversationReqStatus
    ) {
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client, this.encryptionService);
            const requestMapper = new MapToRequestDto();

            const changeRequestStatusUseCase = new ChangeRequestStatusUseCase(
                participantRepo,
                conversationRequestsRepo,
                requestMapper,
                RedisCacheService
            );

            return await changeRequestStatusUseCase.changeRequestStatusUseCase(
                actorId,
                conversationId,
                requestId,
                reviewMessage,
                status
            );
        })
    }
}