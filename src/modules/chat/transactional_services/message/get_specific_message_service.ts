import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {FindMessageById} from "../../shared/find_message_by_id";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {GetSpecificMessageUseCase} from "../../application/message/get_specific_message_use_case";
import {RedisCacheService} from "../../../../container";


export class GetSpecificMessageService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async getSpecificMessageService(actorId: string, conversationId: string, messageId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client);
            const messageMapper = new MapToMessage();
            const findMessageById = new FindMessageById(messageRepo);
            const participantRepo = new ParticipantRepositoryPg(client);

            const getSpecificMessageUseCase = new GetSpecificMessageUseCase(
                messageMapper,
                findMessageById,
                participantRepo,
                RedisCacheService
            );

            return await getSpecificMessageUseCase.getSpecificMessageUseCase(
                actorId,
                conversationId,
                messageId
            );
        })
    }
}