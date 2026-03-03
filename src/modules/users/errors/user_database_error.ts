

export class UserDatabaseError extends Error {
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


