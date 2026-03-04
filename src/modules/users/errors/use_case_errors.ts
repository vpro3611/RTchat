import {AuthentificationError, NotFoundError, ValidationError} from "../../../http_errors_base";


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