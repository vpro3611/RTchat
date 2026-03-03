

export class UserNotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class OldPasswordNotMatchError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message: string) {
        super(message);
    }
}