"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = void 0;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const parsedParams = schema.parse(req.params);
            req.params = parsedParams;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateParams = validateParams;
