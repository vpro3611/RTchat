"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => (req, res, next) => {
    try {
        const parsedBody = schema.parse(req.body);
        req.body = parsedBody;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateBody = validateBody;
