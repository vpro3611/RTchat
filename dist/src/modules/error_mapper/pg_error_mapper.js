"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPgError = mapPgError;
const pg_1 = require("pg");
function safeString(val) {
    try {
        if (typeof val === 'string')
            return val;
        if (val === null || val === undefined)
            return '';
        return String(val);
    }
    catch {
        return '';
    }
}
function mapPgError(err) {
    // If it's already a safe Error, just return it
    if (err instanceof Error) {
        return err;
    }
    // If it's a DatabaseError
    if (err instanceof pg_1.DatabaseError) {
        const code = err.code;
        switch (code) {
            case "23505":
                return new Error("Duplicate entity");
            case "23503":
                return new Error("Referenced entity does not exist");
            case "23502":
                return new Error("Required column is null");
            case "23514":
                return new Error("Check constraint violated");
            case "23P01":
                return new Error("Exclusion constraint violation");
            case "22P02":
                return new Error("Invalid identifier format");
            case "22001":
                return new Error("Value too long for column");
            case "22007":
                return new Error("Invalid datetime format");
            case "22003":
                return new Error("Numeric value out of range");
            case "42703":
                return new Error("Column does not exist");
            case "42P01":
                return new Error("Table does not exist");
            case "42883":
                return new Error("Undefined function in query");
            case "42601":
                return new Error("SQL syntax error");
            case "40001":
                return new Error("Transaction serialization failure");
            case "40P01":
                return new Error("Deadlock detected");
            case "53300":
                return new Error("Too many database connections");
            case "57014":
                return new Error("Query canceled");
            case "08006":
                return new Error("Database connection failure");
            default:
                return new Error(`Database error: ${code}`);
        }
    }
    // If it's an object with code property (pg error in newer versions)
    if (err && typeof err === 'object') {
        const code = err.code;
        if (typeof code === 'string') {
            switch (code) {
                case "23505":
                    return new Error("Duplicate entity");
                case "23503":
                    return new Error("Referenced entity does not exist");
                case "23502":
                    return new Error("Required column is null");
                case "23514":
                    return new Error("Check constraint violated");
                case "23P01":
                    return new Error("Exclusion constraint violation");
                default:
                    return new Error(`Database error: ${code}`);
            }
        }
    }
    // Fallback
    return new Error("Unknown database error");
}
