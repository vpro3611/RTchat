import {InvalidPasswordError, PasswordTooLongError, PasswordTooShortError} from "../errors/password_errors";


export class Password {
    private constructor(private readonly value: string) {}

    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 12;
    private static readonly PATTERN = /^(?=.{12,255}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/;

    private static validation(pass: string): string {
        if (pass.length > this.MAX_LENGTH) {
            throw new PasswordTooLongError(this.MAX_LENGTH, pass.length);
        }
        if (pass.length < this.MIN_LENGTH) {
            throw new PasswordTooShortError(this.MIN_LENGTH, pass.length);
        }
        if (!this.PATTERN.test(pass)) {
            throw new InvalidPasswordError(pass);
        }
        return pass;
    }

    static validatePlain(password: string): string {
        return this.validation(password);
    }

    static fromHash(hash: string): Password {
        return new Password(hash);
    }

    getHash(): string {
        return this.value;
    }
}
