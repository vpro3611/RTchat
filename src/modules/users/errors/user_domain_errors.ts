

export class UserNotActiveError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UserIsNotVerifiedError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class CannotChangeUsernameError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class CannotChangeEmailError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class NotActiveOrVerifiedError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class CannotLoginError extends Error {
    constructor(message: string) {
        super(message);
    }
}