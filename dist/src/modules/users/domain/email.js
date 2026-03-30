"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const email_errors_1 = require("../errors/email_errors");
class Email {
    value;
    constructor(value) {
        this.value = value;
    }
    static MAX_LENGTH = 255;
    static MIN_LENGTH = 5;
    static PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    static validate(email) {
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail.length > this.MAX_LENGTH) {
            throw new email_errors_1.TooLongEmailError(this.MAX_LENGTH, normalizedEmail.length);
        }
        if (normalizedEmail.length < this.MIN_LENGTH) {
            throw new email_errors_1.TooShortEmailError(this.MIN_LENGTH, normalizedEmail.length);
        }
        if (!this.PATTERN.test(normalizedEmail)) {
            throw new email_errors_1.InvalidEmailError(normalizedEmail);
        }
        return normalizedEmail;
    }
    ;
    static create(rawEmail) {
        const normalizedEmail = this.validate(rawEmail);
        return new Email(normalizedEmail);
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.Email = Email;
