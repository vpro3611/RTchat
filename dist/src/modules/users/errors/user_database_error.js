"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsernameAlreadyExistDatabaseError = exports.EmailAlreadyExistDatabaseError = exports.DatabaseUniqueConstraintError = exports.DatabaseQueryError = exports.DatabaseConnectionError = exports.ColumnNotFoundError = exports.TableNotFoundError = exports.UserDatabaseError = void 0;
const http_errors_base_1 = require("../../../http_errors_base");
class UserDatabaseError extends http_errors_base_1.InternalServerError {
    constructor(message) {
        super(message);
    }
}
exports.UserDatabaseError = UserDatabaseError;
class TableNotFoundError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.TableNotFoundError = TableNotFoundError;
class ColumnNotFoundError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.ColumnNotFoundError = ColumnNotFoundError;
class DatabaseConnectionError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
class DatabaseQueryError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.DatabaseQueryError = DatabaseQueryError;
class DatabaseUniqueConstraintError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.DatabaseUniqueConstraintError = DatabaseUniqueConstraintError;
class EmailAlreadyExistDatabaseError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.EmailAlreadyExistDatabaseError = EmailAlreadyExistDatabaseError;
class UsernameAlreadyExistDatabaseError extends UserDatabaseError {
    constructor(message) {
        super(message);
    }
}
exports.UsernameAlreadyExistDatabaseError = UsernameAlreadyExistDatabaseError;
