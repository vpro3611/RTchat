import {
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError
} from "../../../../http_errors_base";


export class ConversationRequestsNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message);
    }
}

export class ConversationRequestNotCreatedError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotPerformActionOverReqError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}