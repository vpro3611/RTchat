"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveMessageService = void 0;
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const saved_messages_repo_pg_1 = require("../../repositories_pg_realization/saved_messages_repo_pg");
const message_repository_pg_1 = require("../../repositories_pg_realization/message_repository_pg");
const map_to_saved_message_dto_1 = require("../../shared/map_to_saved_message_dto");
const save_message_use_case_1 = require("../../application/saved_messages/save_message_use_case");
const container_1 = require("../../../../container");
class SaveMessageService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async saveMessageService(actorId, messageId, conversationId) {
        /*
        private readonly participantRepo: ParticipantRepoInterface,
                private readonly savedMessageRepo: SavedMessagesRepoInterface,
                private readonly messageRepo: MessageRepoInterface,
                private readonly mapToSavedMessageDto: MapToSavedMessageDto,
                private readonly cacheService: CacheServiceInterface
         */
        return await this.txManager.runInTransaction(async (client) => {
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const savedMessageRepo = new saved_messages_repo_pg_1.SavedMessagesRepoPg(client);
            const messageRepo = new message_repository_pg_1.MessageRepositoryPg(client);
            const mapToSavedMessageDto = new map_to_saved_message_dto_1.MapToSavedMessageDto();
            const saveMessageUseCase = new save_message_use_case_1.SaveMessageUseCase(participantRepo, savedMessageRepo, messageRepo, mapToSavedMessageDto, container_1.RedisCacheService);
            return await saveMessageUseCase
                .saveMessageUseCase(actorId, messageId, conversationId);
        });
    }
}
exports.SaveMessageService = SaveMessageService;
