"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class UserIdError extends http_errors_base_1.AuthentificationError {
    constructor(message) {
        super(message);
    }
}
exports.UserIdError = UserIdError;
