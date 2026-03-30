"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditMessageTxService = void 0;
const message_repository_pg_1 = require("../../repositories_pg_realization/message_repository_pg");
const map_to_message_1 = require("../../shared/map_to_message");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const is_participant_1 = require("../../shared/is_participant");
const find_message_by_id_1 = require("../../shared/find_message_by_id");
const edit_message_use_case_1 = require("../../application/message/edit_message_use_case");
const container_1 = require("../../../../container");
class EditMessageTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async editMessageTxService(actorId, conversationId, messageId, newContent) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new message_repository_pg_1.MessageRepositoryPg(client);
            const messageMapper = new map_to_message_1.MapToMessage();
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const checkIsParticipant = new is_participant_1.CheckIsParticipant(participantRepo);
            const findMessageById = new find_message_by_id_1.FindMessageById(messageRepo);
            const editMessageUseCase = new edit_message_use_case_1.EditMessageUseCase(messageRepo, messageMapper, checkIsParticipant, findMessageById, container_1.RedisCacheService);
            return await editMessageUseCase.editMessageUseCase(actorId, conversationId, messageId, newContent);
        });
    }
}
exports.EditMessageTxService = EditMessageTxService;
