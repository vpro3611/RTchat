import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {ConversationRequestsRepositoryPg} from "../../repositories_pg_realization/conversation_requests_repository_pg";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {WithdrawRequestUseCase} from "../../application/conversation_requests/withdraw_request_use_case";
import {RedisCacheService} from "../../../../container";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";


export class WithdrawRequestService {
    constructor(private readonly txManager: TransactionManagerInterface, private readonly encryptionService: EncryptionPort) {}


    async withdrawRequestService(actorId: string, requestId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const conversationRequestsRepo = new ConversationRequestsRepositoryPg(client, this.encryptionService);
            const mapToRequestDto = new MapToRequestDto();

            const withdrawRequestUseCase = new WithdrawRequestUseCase(
                userRepoReader,
                conversationRequestsRepo,
                mapToRequestDto,
                RedisCacheService
            );

            return await withdrawRequestUseCase.withdrawRequestUseCase(
                actorId,
                requestId
            );
        })
    }

}