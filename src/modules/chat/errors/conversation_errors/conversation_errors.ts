import {ConflictError, NotFoundError, ValidationError} from "../../../../http_errors_base";


export class CannotCreateConversationError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}

export class ConversationNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotUpdateTitleError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class DirectConversationTwoUsersError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidTitleError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}
