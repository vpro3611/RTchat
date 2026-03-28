import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {UserToUserBlocksPg} from "../../../users/repositories/user_to_user_blocks_pg";
import {
    AddParticipantToConversationUseCase
} from "../../application/participant/add_participant_to_conversation_use_case";
import {RedisCacheService} from "../../../../container";
import {UserRepoReaderPg} from "../../../users/repositories/user_repo_reader_pg";


export class AddParticipantToConversationTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async addParticipantToConversationTxService(actorId: string, targetId: string, conversationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            /*
            private readonly userRepo: UserRepoReaderPg,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationBansRepo: ConversationBansInterface,
                private readonly participantMapper: MapToParticipantDto,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly userToUserBansRepo: UserToUserBlocksInterface,
                private readonly cacheService: CacheServiceInterface,
             */

            const userRepo = new UserRepoReaderPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);
            const participantMapper = new MapToParticipantDto();
            const conversationRepo = new ConversationRepositoryPg(client);
            const userToUserBansRepo = new UserToUserBlocksPg(client);

            const addParticipantToConversationUseCase = new AddParticipantToConversationUseCase(
                userRepo,
                participantRepo,
                conversationBansRepo,
                participantMapper,
                conversationRepo,
                userToUserBansRepo,
                RedisCacheService
            );

            return await addParticipantToConversationUseCase
                .addParticipantToConversationUseCase(
                    actorId,
                    targetId,
                    conversationId
                );
        })
    }
}