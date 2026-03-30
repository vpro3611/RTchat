"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannotPerformActionOverReqError = exports.ConversationRequestNotCreatedError = exports.ConversationRequestsNotFoundError = void 0;
const http_errors_base_1 = require("../../../../http_errors_base");
class ConversationRequestsNotFoundError extends http_errors_base_1.NotFoundError {
    constructor(message) {
        super(message);
    }
}
exports.ConversationRequestsNotFoundError = ConversationRequestsNotFoundError;
class ConversationRequestNotCreatedError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.ConversationRequestNotCreatedError = ConversationRequestNotCreatedError;
class CannotPerformActionOverReqError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.CannotPerformActionOverReqError = CannotPerformActionOverReqError;
