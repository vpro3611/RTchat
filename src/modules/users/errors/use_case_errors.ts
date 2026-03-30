import {AuthentificationError, ConflictError, NotFoundError, ValidationError} from "../../../http_errors_base";


export class UserNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message);
    }
}

export class OldPasswordNotMatchError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidCredentialsError extends AuthentificationError {
    constructor(message: string) {
        super(message);
    }
}

export class PendingEmailNotFoundError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}

export class PendingPasswordNotFoundError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotBlockYourselfError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class BlockUserError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class UnblockUserError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}
