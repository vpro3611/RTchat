import {AuthorizationError, ConflictError} from "../../../http_errors_base";


export class UserNotActiveError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class UserIsNotVerifiedError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotChangeUsernameError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotChangeEmailError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class NotActiveOrVerifiedError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotLoginError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}