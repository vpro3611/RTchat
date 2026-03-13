import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {CheckIsParticipant} from "../../shared/is_participant";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";
import {UpdateConversationTitleUseCase} from "../../application/conversation/update_conversation_title_use_case";
import {RedisCacheService} from "../../../../container";


export class UpdateConversationTitleTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async updateConversationTitleTxService(actorId: string, conversationId: string, newTitle: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const checkIsParticipant = new CheckIsParticipant(participantRepo);
            const conversationMapper = new MapToConversationDto();

            const updateConversationTitleUseCase = new UpdateConversationTitleUseCase(
                conversationRepo,
                checkIsParticipant,
                conversationMapper,
                RedisCacheService,
                participantRepo
            );

            return await updateConversationTitleUseCase.updateConversationTitleUseCase(actorId, conversationId, newTitle);
        })
    }
}