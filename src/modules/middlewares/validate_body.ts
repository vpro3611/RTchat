import {ZodSchema} from "zod";


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