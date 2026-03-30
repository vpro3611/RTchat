"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Username = void 0;
const username_errors_1 = require("../errors/username_errors");
class Username {
    value;
    constructor(value) {
        this.value = value;
    }
    static MAX_LENGTH = 255;
    static MIN_LENGTH = 3;
    static validate(username) {
        const normalizedUsername = username.trim();
        if (normalizedUsername.length > this.MAX_LENGTH) {
            throw new username_errors_1.UsernameTooLongError(this.MAX_LENGTH, normalizedUsername.length);
        }
        if (normalizedUsername.length < this.MIN_LENGTH) {
            throw new username_errors_1.UsernameTooShortError(this.MIN_LENGTH, normalizedUsername.length);
        }
        return normalizedUsername;
    }
    ;
    static create(rawUsername) {
        const normalizedUsername = this.validate(rawUsername);
        return new Username(normalizedUsername);
    }
    getValue() {
        return this.value;
    }
}
exports.Username = Username;
