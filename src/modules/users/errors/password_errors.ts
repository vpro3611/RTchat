

export class PasswordTooShortError extends Error {
    constructor(minLength: number, yourLength: number) {
        super(`Your password is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}

export class PasswordTooLongError extends Error {
    constructor(maxLength: number, yourLength: number) {
        super(`Your password is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}

export class InvalidPasswordError extends Error {
    constructor(password: string) {
        super(`Your password is invalid: ${password}`);
    }
}