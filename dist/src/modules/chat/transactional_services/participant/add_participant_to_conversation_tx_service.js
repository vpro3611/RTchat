"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddParticipantToConversationTxService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
const map_to_participant_dto_1 = require("../../shared/map_to_participant_dto");
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const user_to_user_blocks_pg_1 = require("../../../users/repositories/user_to_user_blocks_pg");
const add_participant_to_conversation_use_case_1 = require("../../application/participant/add_participant_to_conversation_use_case");
const container_1 = require("../../../../container");
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
class AddParticipantToConversationTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async addParticipantToConversationTxService(actorId, targetId, conversationId) {
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
            const userRepo = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const participantMapper = new map_to_participant_dto_1.MapToParticipantDto();
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const userToUserBansRepo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
            const addParticipantToConversationUseCase = new add_participant_to_conversation_use_case_1.AddParticipantToConversationUseCase(userRepo, participantRepo, conversationBansRepo, participantMapper, conversationRepo, userToUserBansRepo, container_1.RedisCacheService);
            return await addParticipantToConversationUseCase
                .addParticipantToConversationUseCase(actorId, targetId, conversationId);
        });
    }
}
exports.AddParticipantToConversationTxService = AddParticipantToConversationTxService;
