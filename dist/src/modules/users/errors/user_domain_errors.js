"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannotLoginError = exports.NotActiveOrVerifiedError = exports.CannotChangeEmailError = exports.CannotChangeUsernameError = exports.UserIsNotVerifiedError = exports.UserNotActiveError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class UserNotActiveError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.UserNotActiveError = UserNotActiveError;
class UserIsNotVerifiedError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.UserIsNotVerifiedError = UserIsNotVerifiedError;
class CannotChangeUsernameError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.CannotChangeUsernameError = CannotChangeUsernameError;
class CannotChangeEmailError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.CannotChangeEmailError = CannotChangeEmailError;
class NotActiveOrVerifiedError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.NotActiveOrVerifiedError = NotActiveOrVerifiedError;
class CannotLoginError extends http_errors_base_1.AuthorizationError {
    constructor(message) {
        super(message);
    }
}
exports.CannotLoginError = CannotLoginError;
