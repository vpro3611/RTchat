"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthentificationError = exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ValidationError = ValidationError;
class AuthentificationError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.AuthentificationError = AuthentificationError;
class AuthorizationError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.InternalServerError = InternalServerError;
