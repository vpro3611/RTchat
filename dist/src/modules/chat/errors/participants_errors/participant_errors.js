"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientPermissionsError = exports.CannotJoinDirectConversationError = exports.UserAlreadyParticipantError = exports.UserIsNotParticipantError = exports.ActorIsNotParticipantError = exports.UserIsNotAnAuthorError = exports.UserIsNotAllowedToPerformError = exports.ParticipantNotFoundError = void 0;
const http_errors_base_1 = require("../../../../http_errors_base");
class ParticipantNotFoundError extends http_errors_base_1.NotFoundError {
    constructor(message) {
        super(message);
    }
}
exports.ParticipantNotFoundError = ParticipantNotFoundError;
class UserIsNotAllowedToPerformError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.UserIsNotAllowedToPerformError = UserIsNotAllowedToPerformError;
class UserIsNotAnAuthorError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.UserIsNotAnAuthorError = UserIsNotAnAuthorError;
class ActorIsNotParticipantError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.ActorIsNotParticipantError = ActorIsNotParticipantError;
class UserIsNotParticipantError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.UserIsNotParticipantError = UserIsNotParticipantError;
class UserAlreadyParticipantError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.UserAlreadyParticipantError = UserAlreadyParticipantError;
class CannotJoinDirectConversationError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.CannotJoinDirectConversationError = CannotJoinDirectConversationError;
class InsufficientPermissionsError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.InsufficientPermissionsError = InsufficientPermissionsError;
