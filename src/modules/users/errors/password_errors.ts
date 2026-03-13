import {ValidationError} from "../../../http_errors_base";


export class PasswordTooShortError extends ValidationError {
    constructor(minLength: number, yourLength: number) {
        super(`Your password is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}

export class PasswordTooLongError extends ValidationError {
    constructor(maxLength: number, yourLength: number) {
        super(`Your password is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}

export class InvalidPasswordError extends ValidationError {
    constructor(password: string) {
        super(`Your password is invalid: ${password}`);
    }
}