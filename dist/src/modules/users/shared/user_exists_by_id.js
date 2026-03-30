"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLookup = void 0;
const use_case_errors_1 = require("../errors/use_case_errors");
class UserLookup {
    userRepoReader;
    constructor(userRepoReader) {
        this.userRepoReader = userRepoReader;
    }
    async getUserOrThrow(id) {
        const user = await this.userRepoReader.getUserById(id);
        if (!user) {
            throw new use_case_errors_1.UserNotFoundError(`User not found`);
        }
        return user;
    }
}
exports.UserLookup = UserLookup;
