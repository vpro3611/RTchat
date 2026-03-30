"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractActorId = void 0;
const user_auth_error_1 = require("../../authentification/errors/user_auth_error");
class ExtractActorId {
    extractActorId(req) {
        if (!req.user) {
            throw new user_auth_error_1.UserIdError("Fatal : User id not found in request");
        }
        return req.user;
    }
}
exports.ExtractActorId = ExtractActorId;
