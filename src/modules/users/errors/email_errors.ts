

export class TooLongEmailError extends Error {
    constructor(maxLength: number, yourLength: number) {
        super(`Your email is too long. Max length is ${maxLength} and your length is ${yourLength}`);
    }
}

export class TooShortEmailError extends Error {
    constructor(minLength: number, yourLength: number) {
        super(`Your email is too short. Min length is ${minLength} and your length is ${yourLength}`);
    }
}

export class InvalidEmailError extends Error {
    constructor(email: string) {
        super(`Your email is invalid: ${email}`);
    }
}

export class EmailAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`Email ${email} already exists`);
    }
}