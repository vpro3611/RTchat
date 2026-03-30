"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTitleError = exports.DirectConversationTwoUsersError = exports.CannotUpdateTitleError = exports.ConversationNotFoundError = exports.CannotCreateConversationError = void 0;
const http_errors_base_1 = require("../../../../http_errors_base");
class CannotCreateConversationError extends http_errors_base_1.ValidationError {
    constructor(message) {
        super(message);
    }
}
exports.CannotCreateConversationError = CannotCreateConversationError;
class ConversationNotFoundError extends http_errors_base_1.NotFoundError {
    constructor(message) {
        super(message);
    }
}
exports.ConversationNotFoundError = ConversationNotFoundError;
class CannotUpdateTitleError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.CannotUpdateTitleError = CannotUpdateTitleError;
class DirectConversationTwoUsersError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.DirectConversationTwoUsersError = DirectConversationTwoUsersError;
class InvalidTitleError extends http_errors_base_1.ValidationError {
    constructor(message) {
        super(message);
    }
}
exports.InvalidTitleError = InvalidTitleError;
