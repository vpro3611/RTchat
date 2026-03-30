"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDatabaseError = void 0;
const http_errors_base_1 = require("../../http_errors_base");
class CustomDatabaseError extends http_errors_base_1.InternalServerError {
    constructor(message) {
        super(message);
    }
}
exports.CustomDatabaseError = CustomDatabaseError;
