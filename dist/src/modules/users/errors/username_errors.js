"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsernameAlreadyExistsError = exports.UsernameTooShortError = exports.UsernameTooLongError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class UsernameTooLongError extends http_errors_base_1.ValidationError {
    constructor(maxLength, yourLength) {
        super(`Your username is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}
exports.UsernameTooLongError = UsernameTooLongError;
class UsernameTooShortError extends http_errors_base_1.ValidationError {
    constructor(minLength, yourLength) {
        super(`Your username is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}
exports.UsernameTooShortError = UsernameTooShortError;
class UsernameAlreadyExistsError extends http_errors_base_1.ConflictError {
    constructor(username) {
        super(`Username ${username} already exists`);
    }
}
exports.UsernameAlreadyExistsError = UsernameAlreadyExistsError;
