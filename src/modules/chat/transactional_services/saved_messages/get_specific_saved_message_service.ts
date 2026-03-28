import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";
import {SavedMessagesRepoPg} from "../../repositories_pg_realization/saved_messages_repo_pg";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";
import {GetSpecificMessageUseCase} from "../../application/message/get_specific_message_use_case";
import {GetSpecificSavedMessageUseCase} from "../../application/saved_messages/get_specific_saved_message_use_case";
import {RedisCacheService} from "../../../../container";


export class GetSpecificSavedMessageService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getSpecificSavedMessageService(actorId: string, messageId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const savedMessageRepo = new SavedMessagesRepoPg(client);
            const mapToSavedMessageDto = new MapToSavedMessageDto();


            const getSpecificSavedMessage = new GetSpecificSavedMessageUseCase(
                userRepoReader,
                savedMessageRepo,
                mapToSavedMessageDto,
                RedisCacheService,
            );

            return await getSpecificSavedMessage
                .getSpecificSavedMessageUseCase(actorId, messageId);
        })
    }
}