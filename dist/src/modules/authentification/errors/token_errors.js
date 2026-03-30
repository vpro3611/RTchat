"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenNotFound = exports.TokenExpiredError = exports.InvalidTokenJWTError = exports.SecretNotDefinedError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class SecretNotDefinedError extends http_errors_base_1.InternalServerError {
    constructor(message) {
        super(message);
    }
}
exports.SecretNotDefinedError = SecretNotDefinedError;
class InvalidTokenJWTError extends http_errors_base_1.AuthentificationError {
    constructor(message) {
        super(message);
    }
}
exports.InvalidTokenJWTError = InvalidTokenJWTError;
class TokenExpiredError extends http_errors_base_1.AuthentificationError {
    constructor(message) {
        super(message);
    }
}
exports.TokenExpiredError = TokenExpiredError;
class RefreshTokenNotFound extends http_errors_base_1.AuthentificationError {
    constructor(message) {
        super(message);
    }
}
exports.RefreshTokenNotFound = RefreshTokenNotFound;
