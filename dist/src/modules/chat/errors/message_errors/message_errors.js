"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannotEditMessageError = exports.InvalidMessageError = exports.MessageNotAPartOfConversationError = exports.MessageNotFoundError = void 0;
const http_errors_base_1 = require("../../../../http_errors_base");
class MessageNotFoundError extends http_errors_base_1.NotFoundError {
    constructor(message) {
        super(message);
    }
}
exports.MessageNotFoundError = MessageNotFoundError;
class MessageNotAPartOfConversationError extends http_errors_base_1.ValidationError {
    constructor(message) {
        super(message);
    }
}
exports.MessageNotAPartOfConversationError = MessageNotAPartOfConversationError;
class InvalidMessageError extends http_errors_base_1.ValidationError {
    constructor(message) {
        super(message);
    }
}
exports.InvalidMessageError = InvalidMessageError;
class CannotEditMessageError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.CannotEditMessageError = CannotEditMessageError;
