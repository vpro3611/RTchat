import {ZodSchema} from "zod/v3";


export const validateBody = <T>(schema: ZodSchema<T>) =>
    (req: any, res: any, next: any) => {
        try {
            const parsedBody = schema.parse(req.body);
            req.body = parsedBody;
            next();
        } catch (error) {
            next(error);
        }
    }