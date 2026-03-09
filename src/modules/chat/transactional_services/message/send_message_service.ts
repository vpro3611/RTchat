import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {CheckIsParticipant} from "../../shared/is_participant";
import {SendMessageUseCase} from "../../application/message/send_message_use_case";
import {RedisCacheService} from "../../../../container";


export class SendMessageTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async sendMessageTxService(actorId: string, conversationId: string, content: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client);
            const conversationRepo = new ConversationRepositoryPg(client);
            const messageMapper = new MapToMessage();
            const participantRepo = new ParticipantRepositoryPg(client);
            const checkIsParticipant = new CheckIsParticipant(participantRepo);

            const sendMessageUseCase = new SendMessageUseCase(
                messageRepo,
                conversationRepo,
                messageMapper,
                checkIsParticipant,
                RedisCacheService,
                participantRepo
            );

            return await sendMessageUseCase.sendMessageUseCase(actorId, conversationId, content);
        })
    }
}