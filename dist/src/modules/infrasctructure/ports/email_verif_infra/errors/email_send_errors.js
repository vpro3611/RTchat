"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSendError = void 0;
class EmailSendError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.EmailSendError = EmailSendError;
