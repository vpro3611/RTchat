import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {SavedMessagesRepoPg} from "../../repositories_pg_realization/saved_messages_repo_pg";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {MapToSavedMessageDto} from "../../shared/map_to_saved_message_dto";
import {SaveMessageUseCase} from "../../application/saved_messages/save_message_use_case";
import {RedisCacheService} from "../../../../container";


export class SaveMessageService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async saveMessageService(actorId: string, messageId: string, conversationId: string) {
        /*
        private readonly participantRepo: ParticipantRepoInterface,
                private readonly savedMessageRepo: SavedMessagesRepoInterface,
                private readonly messageRepo: MessageRepoInterface,
                private readonly mapToSavedMessageDto: MapToSavedMessageDto,
                private readonly cacheService: CacheServiceInterface
         */

        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new ParticipantRepositoryPg(client);
            const savedMessageRepo = new SavedMessagesRepoPg(client);
            const messageRepo = new MessageRepositoryPg(client);
            const mapToSavedMessageDto = new MapToSavedMessageDto();


            const saveMessageUseCase = new SaveMessageUseCase(
                participantRepo,
                savedMessageRepo,
                messageRepo,
                mapToSavedMessageDto,
                RedisCacheService,
            );

            return await saveMessageUseCase
                .saveMessageUseCase(actorId, messageId, conversationId);
        })
    }
}