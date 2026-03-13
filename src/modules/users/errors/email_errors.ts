import {ConflictError, ValidationError} from "../../../http_errors_base";


export class TooLongEmailError extends ValidationError {
    constructor(maxLength: number, yourLength: number) {
        super(`Your email is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}

export class TooShortEmailError extends ValidationError {
    constructor(minLength: number, yourLength: number) {
        super(`Your email is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}

export class InvalidEmailError extends ValidationError {
    constructor(email: string) {
        super(`Your email is invalid: ${email}`);
    }
}

export class EmailAlreadyExistsError extends ConflictError {
    constructor(email: string) {
        super(`Email ${email} already exists`);
    }
}