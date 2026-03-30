"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMessageTxService = void 0;
const message_repository_pg_1 = require("../../repositories_pg_realization/message_repository_pg");
const map_to_message_1 = require("../../shared/map_to_message");
const is_participant_1 = require("../../shared/is_participant");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const get_messages_use_case_1 = require("../../application/message/get_messages_use_case");
const container_1 = require("../../../../container");
class GetMessageTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getMessageTxService(actorId, conversationId, limit, cursor) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new message_repository_pg_1.MessageRepositoryPg(client);
            const messageMapper = new map_to_message_1.MapToMessage();
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const checkIsParticipant = new is_participant_1.CheckIsParticipant(participantRepo);
            const getMessagesUseCase = new get_messages_use_case_1.GetMessagesUseCase(messageRepo, messageMapper, container_1.RedisCacheService, participantRepo);
            return await getMessagesUseCase.getMessagesUseCase(actorId, conversationId, limit, cursor);
        });
    }
}
exports.GetMessageTxService = GetMessageTxService;
