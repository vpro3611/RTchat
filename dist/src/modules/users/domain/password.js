"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const password_errors_1 = require("../errors/password_errors");
class Password {
    value;
    constructor(value) {
        this.value = value;
    }
    static MAX_LENGTH = 255;
    static MIN_LENGTH = 12;
    static PATTERN = /^(?=.{12,255}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/;
    static validation(pass) {
        if (pass.length > this.MAX_LENGTH) {
            throw new password_errors_1.PasswordTooLongError(this.MAX_LENGTH, pass.length);
        }
        if (pass.length < this.MIN_LENGTH) {
            throw new password_errors_1.PasswordTooShortError(this.MIN_LENGTH, pass.length);
        }
        if (!this.PATTERN.test(pass)) {
            throw new password_errors_1.InvalidPasswordError(pass);
        }
        return pass;
    }
    static validatePlain(password) {
        return this.validation(password);
    }
    static fromHash(hash) {
        return new Password(hash);
    }
    getHash() {
        return this.value;
    }
}
exports.Password = Password;
