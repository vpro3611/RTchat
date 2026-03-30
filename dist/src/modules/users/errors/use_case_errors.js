"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockUserError = exports.BlockUserError = exports.CannotBlockYourselfError = exports.PendingEmailNotFoundError = exports.InvalidCredentialsError = exports.OldPasswordNotMatchError = exports.UserNotFoundError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class UserNotFoundError extends http_errors_base_1.NotFoundError {
    constructor(message) {
        super(message);
    }
}
exports.UserNotFoundError = UserNotFoundError;
class OldPasswordNotMatchError extends http_errors_base_1.ValidationError {
    constructor(message) {
        super(message);
    }
}
exports.OldPasswordNotMatchError = OldPasswordNotMatchError;
class InvalidCredentialsError extends http_errors_base_1.AuthentificationError {
    constructor(message) {
        super(message);
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class PendingEmailNotFoundError extends http_errors_base_1.ValidationError {
    constructor(message) {
        super(message);
    }
}
exports.PendingEmailNotFoundError = PendingEmailNotFoundError;
class CannotBlockYourselfError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.CannotBlockYourselfError = CannotBlockYourselfError;
class BlockUserError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.BlockUserError = BlockUserError;
class UnblockUserError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.UnblockUserError = UnblockUserError;
