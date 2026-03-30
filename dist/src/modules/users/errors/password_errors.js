"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPasswordError = exports.PasswordTooLongError = exports.PasswordTooShortError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class PasswordTooShortError extends http_errors_base_1.ValidationError {
    constructor(minLength, yourLength) {
        super(`Your password is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}
exports.PasswordTooShortError = PasswordTooShortError;
class PasswordTooLongError extends http_errors_base_1.ValidationError {
    constructor(maxLength, yourLength) {
        super(`Your password is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}
exports.PasswordTooLongError = PasswordTooLongError;
class InvalidPasswordError extends http_errors_base_1.ValidationError {
    constructor(password) {
        super(`Your password is invalid: ${password}`);
    }
}
exports.InvalidPasswordError = InvalidPasswordError;
