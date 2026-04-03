import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {SavedMessagesRepoPg} from "../../repositories_pg_realization/saved_messages_repo_pg";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";
import {GetSavedMessagesListUseCase} from "../../application/saved_messages/get_saved_messages_list_use_case";
import {RedisCacheService} from "../../../../container";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";


export class GetSavedMessagesListService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}


    async getSavedMessagesListService(actorId: string, limit?: number, cursor?: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const savedMessageRepo = new SavedMessagesRepoPg(client, this.encryptionService);
            const mapToSavedMessageDto = new MapToSavedMessageDto();

            const getSavedMessagesListUseCase = new GetSavedMessagesListUseCase(
                userRepoReader,
                savedMessageRepo,
                mapToSavedMessageDto,
                RedisCacheService
            );

            return await getSavedMessagesListUseCase
                .getSavedMessagesListUseCase(actorId, limit, cursor);
        })
    }
}