"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveSavedMessageService = void 0;
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const saved_messages_repo_pg_1 = require("../../repositories_pg_realization/saved_messages_repo_pg");
const remove_saved_message_use_case_1 = require("../../application/saved_messages/remove_saved_message_use_case");
const container_1 = require("../../../../container");
class RemoveSavedMessageService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async removeSavedMessageService(actorId, messageId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const savedMessageRepo = new saved_messages_repo_pg_1.SavedMessagesRepoPg(client);
            const removeSavedMessageUseCase = new remove_saved_message_use_case_1.RemoveSavedMessageUseCase(userRepoReader, savedMessageRepo, container_1.RedisCacheService);
            return await removeSavedMessageUseCase
                .removeSavedMessageUseCase(actorId, messageId);
        });
    }
}
exports.RemoveSavedMessageService = RemoveSavedMessageService;
