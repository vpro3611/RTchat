"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificSavedMessageService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const saved_messages_repo_pg_1 = require("../../repositories_pg_realization/saved_messages_repo_pg");
const map_to_saved_message_dto_1 = require("../../shared/map_to_saved_message_dto");
const get_specific_saved_message_use_case_1 = require("../../application/saved_messages/get_specific_saved_message_use_case");
const container_1 = require("../../../../container");
class GetSpecificSavedMessageService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSpecificSavedMessageService(actorId, messageId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const savedMessageRepo = new saved_messages_repo_pg_1.SavedMessagesRepoPg(client);
            const mapToSavedMessageDto = new map_to_saved_message_dto_1.MapToSavedMessageDto();
            const getSpecificSavedMessage = new get_specific_saved_message_use_case_1.GetSpecificSavedMessageUseCase(userRepoReader, savedMessageRepo, mapToSavedMessageDto, container_1.RedisCacheService);
            return await getSpecificSavedMessage
                .getSpecificSavedMessageUseCase(actorId, messageId);
        });
    }
}
exports.GetSpecificSavedMessageService = GetSpecificSavedMessageService;
