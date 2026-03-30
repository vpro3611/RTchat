"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificMessageService = void 0;
const message_repository_pg_1 = require("../../repositories_pg_realization/message_repository_pg");
const map_to_message_1 = require("../../shared/map_to_message");
const find_message_by_id_1 = require("../../shared/find_message_by_id");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const get_specific_message_use_case_1 = require("../../application/message/get_specific_message_use_case");
const container_1 = require("../../../../container");
class GetSpecificMessageService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSpecificMessageService(actorId, conversationId, messageId) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new message_repository_pg_1.MessageRepositoryPg(client);
            const messageMapper = new map_to_message_1.MapToMessage();
            const findMessageById = new find_message_by_id_1.FindMessageById(messageRepo);
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const getSpecificMessageUseCase = new get_specific_message_use_case_1.GetSpecificMessageUseCase(messageMapper, findMessageById, participantRepo, container_1.RedisCacheService);
            return await getSpecificMessageUseCase.getSpecificMessageUseCase(actorId, conversationId, messageId);
        });
    }
}
exports.GetSpecificMessageService = GetSpecificMessageService;
