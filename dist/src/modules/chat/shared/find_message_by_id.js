"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindMessageById = void 0;
const message_errors_1 = require("../errors/message_errors/message_errors");
class FindMessageById {
    messageRepo;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    async findMessageById(id) {
        const message = await this.messageRepo.findById(id);
        if (!message) {
            throw new message_errors_1.MessageNotFoundError("Message not found");
        }
        return message;
    }
}
exports.FindMessageById = FindMessageById;
