"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractUserIdFromReq = void 0;
const user_auth_error_1 = require("../../authentification/errors/user_auth_error");
class ExtractUserIdFromReq {
    extractUserId(req) {
        if (!req.user) {
            throw new user_auth_error_1.UserIdError('Unauthorized request for token');
        }
        return (req.user.sub);
    }
}
exports.ExtractUserIdFromReq = ExtractUserIdFromReq;
