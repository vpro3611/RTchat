import { Request, Response, NextFunction } from "express";
import {ZodError} from "zod";
import {
    AuthentificationError,
    AuthorizationError,
    ConflictError, InternalServerError,
    NotFoundError,
    ValidationError
} from "../../http_errors_base";

const unexpectedErrorMessage = (name: string, message: string): string => {
    const finalMessage = process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : `[DEV] Something went wrong. Please try again later: ${name} | ${message}!`;
    return finalMessage;
}

const internalServerError = (name: string, message: string): string => {
    const finalMessage = process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : `[DEV] Something went wrong. Please try again later: ${name} | ${message}!`;
    return finalMessage;
}

export const errorMiddleware = () => {
    return (err: Error, req: Request, res: Response, _next: NextFunction) => {

        //req.log.error(err);

        if (err instanceof ZodError) {
            return res.status(400).json(
                {
                    code: "VALIDATION_ERROR",
                    message: err.issues.map(issue => issue.message).join(", ")
                }
            );
        }
        if (err instanceof ValidationError) {
            return res.status(400).json(
                {
                    code: "VALIDATION_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof AuthentificationError) {
            return res.status(401).json(
                {
                    code: "AUTHENTIFICATION_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof AuthorizationError) {
            return res.status(403).json(
                {
                    code: "AUTHORIZATION_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof NotFoundError) {
            return res.status(404).json(
                {
                    code: "NOT_FOUND_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof ConflictError) {
            return res.status(409).json(
                {
                    code: "CONFLICT_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof InternalServerError) {
            return res.status(500).json(
                {
                    code: "INTERNAL_SERVER_ERROR",
                    message: internalServerError(err.name, err.message)
                }
            );
        }
        // unexpected error may happen
        return res.status(500).json(
            {
                code: "UNEXPECTED_ERROR",
                message: unexpectedErrorMessage(err.name, err.message)
            }
        );
    }
}