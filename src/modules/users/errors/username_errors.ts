

export class UsernameTooLongError extends Error {
    constructor(maxLength: number, yourLength: number) {
        super(`Your username is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}

export class UsernameTooShortError extends Error {
    constructor(minLength: number, yourLength: number) {
        super(`Your username is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}

export class UsernameAlreadyExistsError extends Error {
    constructor(username: string) {
        super(`Username ${username} already exists`);
    }
}