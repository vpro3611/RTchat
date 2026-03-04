import {ZodSchema} from "zod";
import {NextFunction, Request, Response} from "express";


export const validateParams = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedParams = schema.parse(req.params);
            req.params = parsedParams as any;
            next();
        } catch (error) {
            next(error);
        }
    }
}