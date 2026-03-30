"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAlreadyExistsError = exports.InvalidEmailError = exports.TooShortEmailError = exports.TooLongEmailError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class TooLongEmailError extends http_errors_base_1.ValidationError {
    constructor(maxLength, yourLength) {
        super(`Your email is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}
exports.TooLongEmailError = TooLongEmailError;
class TooShortEmailError extends http_errors_base_1.ValidationError {
    constructor(minLength, yourLength) {
        super(`Your email is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}
exports.TooShortEmailError = TooShortEmailError;
class InvalidEmailError extends http_errors_base_1.ValidationError {
    constructor(email) {
        super(`Your email is invalid: ${email}`);
    }
}
exports.InvalidEmailError = InvalidEmailError;
class EmailAlreadyExistsError extends http_errors_base_1.ConflictError {
    constructor(email) {
        super(`Email ${email} already exists`);
    }
}
exports.EmailAlreadyExistsError = EmailAlreadyExistsError;
