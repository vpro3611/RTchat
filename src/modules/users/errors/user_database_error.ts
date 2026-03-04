import {InternalServerError} from "../../../http_errors_base";


export class UserDatabaseError extends InternalServerError {
    constructor(message: string) {
        super(message);
    }
}

export class TableNotFoundError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}


export class ColumnNotFoundError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}

export class DatabaseConnectionError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}

export class DatabaseQueryError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}

export class DatabaseUniqueConstraintError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}

export class EmailAlreadyExistDatabaseError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}

export class UsernameAlreadyExistDatabaseError extends UserDatabaseError {
    constructor(message: string) {
        super(message);
    }
}
