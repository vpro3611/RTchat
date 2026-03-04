import {ConflictError, ValidationError} from "../../../http_errors_base";


export class UsernameTooLongError extends ValidationError {
    constructor(maxLength: number, yourLength: number) {
        super(`Your username is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}

export class UsernameTooShortError extends ValidationError {
    constructor(minLength: number, yourLength: number) {
        super(`Your username is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}

export class UsernameAlreadyExistsError extends ConflictError {
    constructor(username: string) {
        super(`Username ${username} already exists`);
    }
}