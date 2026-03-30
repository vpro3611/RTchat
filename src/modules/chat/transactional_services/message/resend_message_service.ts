import {TransactionManagerInterface} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {FindMessageById} from "../../shared/find_message_by_id";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {UserToUserBlocksPg} from "../../../users/repositories/user_to_user_blocks_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {ResendMessageUseCase} from "../../application/message/resend_message_use_case";
import {MessageDTO} from "../../DTO/message_dto";


export class ResendMessageTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly cacheService: CacheServiceInterface
    ) {}

    async resendMessageTxService(
        actorId: string,
        messageId: string,
        sourceConversationId: string,
        targetConversationId: string
    ): Promise<MessageDTO> {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client);
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const userToUserBansRepo = new UserToUserBlocksPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);

            const messageMapper = new MapToMessage();
            const checkIsParticipant = new CheckIsParticipant(participantRepo);
            const findMessageById = new FindMessageById(messageRepo);

            const resendMessageUseCase = new ResendMessageUseCase(
                messageRepo,
                conversationRepo,
                messageMapper,
                checkIsParticipant,
                findMessageById,
                this.cacheService,
                participantRepo,
                userToUserBansRepo,
                conversationBansRepo
            );

            return await resendMessageUseCase.resendMessageUseCase(
                actorId,
                messageId,
                sourceConversationId,
                targetConversationId
            );
        });
    }
}
