import {UsernameTooLongError, UsernameTooShortError} from "../errors/username_errors";


export class Username {
    private constructor(private readonly value: string) {}

    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 3;

    private static validate(username: string) {
        const normalizedUsername = username.trim();
        if (normalizedUsername.length > this.MAX_LENGTH) {
            throw new UsernameTooLongError(this.MAX_LENGTH, normalizedUsername.length);
        }
        if (normalizedUsername.length < this.MIN_LENGTH) {
            throw new UsernameTooShortError(this.MIN_LENGTH, normalizedUsername.length);
        }
        return normalizedUsername;
    };

    static create(rawUsername: string) {
        const normalizedUsername = this.validate(rawUsername);
        return new Username(normalizedUsername);
    }

    getValue(): string {
        return this.value;
    }
}