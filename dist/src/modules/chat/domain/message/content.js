"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const message_errors_1 = require("../../errors/message_errors/message_errors");
class Content {
    text;
    constructor(text) {
        this.text = text;
    }
    static MIN_LENGTH = 1;
    static validateMessage(text) {
        const trimmedMessage = text.trim();
        if (trimmedMessage.length < Content.MIN_LENGTH) {
            throw new message_errors_1.InvalidMessageError('Message must be at least 1 character long');
        }
        return trimmedMessage;
    }
    static create(text) {
        const msg = Content.validateMessage(text);
        return new Content(msg);
    }
    getContentValue() {
        return this.text;
    }
}
exports.Content = Content;
