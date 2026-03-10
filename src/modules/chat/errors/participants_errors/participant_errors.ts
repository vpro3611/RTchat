import {AuthorizationError, ConflictError, NotFoundError} from "../../../../http_errors_base";


export class ParticipantNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message);
    }
}

export class UserIsNotAllowedToPerformError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class UserIsNotAnAuthorError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class ActorIsNotParticipantError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class UserIsNotParticipantError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

export class UserAlreadyParticipantError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class CannotJoinDirectConversationError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}

export class InsufficientPermissionsError extends AuthorizationError {
    constructor(message: string) {
        super(message);
    }
}

