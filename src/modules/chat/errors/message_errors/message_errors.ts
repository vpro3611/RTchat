import {AuthorizationError, ConflictError, NotFoundError, ValidationError} from "../../../../http_errors_base";

export class MessageNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message);
    }
}

export class MessageNotAPartOfConversationError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}


export class InvalidMessageError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotEditMessageError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class InsecureAttachmentError extends ValidationError {
    constructor(message: string) {
        super(message);
    }
}