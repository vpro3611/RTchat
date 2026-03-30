"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTitle = void 0;
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
class ConversationTitle {
    value;
    constructor(value) {
        this.value = value;
    }
    static MIN_LENGTH = 1;
    static MAX_LENGTH = 255;
    static validate(title) {
        const trimmedTitle = title.trim();
        if (trimmedTitle.length < this.MIN_LENGTH) {
            throw new conversation_errors_1.InvalidTitleError(`Title must be at least ${this.MIN_LENGTH} characters long`);
        }
        if (trimmedTitle.length > this.MAX_LENGTH) {
            throw new conversation_errors_1.InvalidTitleError(`Title must be at most ${this.MAX_LENGTH} characters long`);
        }
        return trimmedTitle;
    }
    static create(title) {
        this.validate(title);
        return new ConversationTitle(title);
    }
    static empty() {
        return new ConversationTitle('');
    }
    getValue() {
        return this.value;
    }
}
exports.ConversationTitle = ConversationTitle;
