"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSavedMessagesListService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const saved_messages_repo_pg_1 = require("../../repositories_pg_realization/saved_messages_repo_pg");
const map_to_saved_message_dto_1 = require("../../shared/map_to_saved_message_dto");
const get_saved_messages_list_use_case_1 = require("../../application/saved_messages/get_saved_messages_list_use_case");
const container_1 = require("../../../../container");
class GetSavedMessagesListService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSavedMessagesListService(actorId, limit, cursor) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const savedMessageRepo = new saved_messages_repo_pg_1.SavedMessagesRepoPg(client);
            const mapToSavedMessageDto = new map_to_saved_message_dto_1.MapToSavedMessageDto();
            const getSavedMessagesListUseCase = new get_saved_messages_list_use_case_1.GetSavedMessagesListUseCase(userRepoReader, savedMessageRepo, mapToSavedMessageDto, container_1.RedisCacheService);
            return await getSavedMessagesListUseCase
                .getSavedMessagesListUseCase(actorId, limit, cursor);
        });
    }
}
exports.GetSavedMessagesListService = GetSavedMessagesListService;
