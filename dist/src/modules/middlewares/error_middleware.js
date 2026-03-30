"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const http_errors_base_1 = require("../../http_errors_base");
const unexpectedErrorMessage = (name, message) => {
    const finalMessage = process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : `[DEV] Something went wrong. Please try again later: ${name} | ${message}!`;
    return finalMessage;
};
const internalServerError = (name, message) => {
    const finalMessage = process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : `[DEV] Something went wrong. Please try again later: ${name} | ${message}!`;
    return finalMessage;
};
const errorMiddleware = () => {
    return (err, req, res, _next) => {
        //req.log.error(err);
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({
                code: "VALIDATION_ERROR",
                message: err.issues.map(issue => issue.message).join(", ")
            });
        }
        if (err instanceof http_errors_base_1.ValidationError) {
            return res.status(400).json({
                code: "VALIDATION_ERROR",
                message: err.message
            });
        }
        if (err instanceof http_errors_base_1.AuthentificationError) {
            return res.status(401).json({
                code: "AUTHENTIFICATION_ERROR",
                message: err.message
            });
        }
        if (err instanceof http_errors_base_1.AuthorizationError) {
            return res.status(403).json({
                code: "AUTHORIZATION_ERROR",
                message: err.message
            });
        }
        if (err instanceof http_errors_base_1.NotFoundError) {
            return res.status(404).json({
                code: "NOT_FOUND_ERROR",
                message: err.message
            });
        }
        if (err instanceof http_errors_base_1.ConflictError) {
            return res.status(409).json({
                code: "CONFLICT_ERROR",
                message: err.message
            });
        }
        if (err instanceof http_errors_base_1.InternalServerError) {
            return res.status(500).json({
                code: "INTERNAL_SERVER_ERROR",
                message: internalServerError(err.name, err.message)
            });
        }
        // unexpected error may happen
        return res.status(500).json({
            code: "UNEXPECTED_ERROR",
            message: unexpectedErrorMessage(err.name, err.message)
        });
    };
};
exports.errorMiddleware = errorMiddleware;
