"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotBannedError = void 0;
const http_errors_base_1 = require("../../../../http_errors_base");
class NotBannedError extends http_errors_base_1.ConflictError {
    constructor(message) {
        super(message);
    }
}
exports.NotBannedError = NotBannedError;
