

export class SecretNotDefinedError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidTokenJWTError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class TokenExpiredError extends Error {
    constructor(message: string) {
        super(message);
    }
}