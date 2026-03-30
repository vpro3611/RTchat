import {AuthentificationError, InternalServerError} from "../../../http_errors_base";


export class SecretNotDefinedError extends InternalServerError {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidTokenJWTError extends AuthentificationError {
    constructor(message: string) {
        super(message);
    }
}

export class TokenExpiredError extends AuthentificationError {
    constructor(message: string) {
        super(message);
    }
}

export class RefreshTokenNotFound extends AuthentificationError {
    constructor(message: string) {
        super(message);
    }
}