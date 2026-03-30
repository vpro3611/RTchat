"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageTxService = void 0;
const message_repository_pg_1 = require("../../repositories_pg_realization/message_repository_pg");
const conversation_repository_pg_1 = require("../../repositories_pg_realization/conversation_repository_pg");
const map_to_message_1 = require("../../shared/map_to_message");
const participant_repository_pg_1 = require("../../repositories_pg_realization/participant_repository_pg");
const is_participant_1 = require("../../shared/is_participant");
const send_message_use_case_1 = require("../../application/message/send_message_use_case");
const container_1 = require("../../../../container");
const user_to_user_blocks_pg_1 = require("../../../users/repositories/user_to_user_blocks_pg");
const conversation_bans_repository_pg_1 = require("../../repositories_pg_realization/conversation_bans_repository_pg");
class SendMessageTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async sendMessageTxService(actorId, conversationId, content) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new message_repository_pg_1.MessageRepositoryPg(client);
            const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
            const messageMapper = new map_to_message_1.MapToMessage();
            const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
            const checkIsParticipant = new is_participant_1.CheckIsParticipant(participantRepo);
            const userToUserBansRepo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
            const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(client);
            const sendMessageUseCase = new send_message_use_case_1.SendMessageUseCase(messageRepo, conversationRepo, messageMapper, checkIsParticipant, container_1.RedisCacheService, participantRepo, userToUserBansRepo, conversationBansRepo);
            return await sendMessageUseCase.sendMessageUseCase(actorId, conversationId, content);
        });
    }
}
exports.SendMessageTxService = SendMessageTxService;
