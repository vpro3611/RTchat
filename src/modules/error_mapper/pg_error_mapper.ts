import {DatabaseError} from "pg";
import {CustomDatabaseError} from "./database_errors";

export function mapPgError(err: unknown): Error {

    if (!(err instanceof DatabaseError)) {
        return new CustomDatabaseError("Unknown database error");
    }

    switch (err.code) {


        // constraint violations


        case "23505":
            return new CustomDatabaseError("Duplicate entity");

        case "23503":
            return new CustomDatabaseError(
                `Referenced entity does not exist (constraint: ${err.constraint})`
            );

        case "23502":
            return new CustomDatabaseError(
                `Required column is null (${err.column})`
            );

        case "23514":
            return new CustomDatabaseError(
                `Check constraint violated (${err.constraint})`
            );

        case "23P01":
            return new CustomDatabaseError("Exclusion constraint violation");


        // data errors


        case "22P02":
            return new CustomDatabaseError("Invalid identifier format");

        case "22001":
            return new CustomDatabaseError("Value too long for column");

        case "22007":
            return new CustomDatabaseError("Invalid datetime format");

        case "22003":
            return new CustomDatabaseError("Numeric value out of range");


        // schema errors


        case "42703":
            return new CustomDatabaseError(`Column does not exist (${err.column})`);

        case "42P01":
            return new CustomDatabaseError(`Table does not exist (${err.table})`);

        case "42883":
            return new CustomDatabaseError("Undefined function in query");

        case "42601":
            return new CustomDatabaseError("SQL syntax error");
        // transaction errors


        case "40001":
            return new CustomDatabaseError("Transaction serialization failure");

        case "40P01":
            return new CustomDatabaseError("Deadlock detected");


        // system errors


        case "53300":
            return new CustomDatabaseError("Too many database connections");

        case "57014":
            return new CustomDatabaseError("Query canceled");

        case "08006":
            return new CustomDatabaseError("Database connection failure");


        // fallback


        default:
            return new CustomDatabaseError(
                `Unhandled database error (${err.code})`
            );
    }
}