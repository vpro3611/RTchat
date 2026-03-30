import {InvalidEmailError, TooLongEmailError, TooShortEmailError} from "../errors/email_errors";


export class Email {
    private constructor(private readonly value: string) {}

    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 5;
    private static readonly PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    private static validate(email: string) {
        const normalizedEmail = email.toLowerCase().trim();

        if (normalizedEmail.length > this.MAX_LENGTH) {
            throw new TooLongEmailError(this.MAX_LENGTH, normalizedEmail.length);
        }
        if (normalizedEmail.length < this.MIN_LENGTH) {
            throw new TooShortEmailError(this.MIN_LENGTH, normalizedEmail.length);
        }
        if (!this.PATTERN.test(normalizedEmail)) {
            throw new InvalidEmailError(normalizedEmail);
        }
        return normalizedEmail;
    };

    static create(rawEmail: string) {
        const normalizedEmail = this.validate(rawEmail);
        return new Email(normalizedEmail);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}