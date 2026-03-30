import {Request} from "express";
import {UserIdError} from "../../authentification/errors/user_auth_error";


export class ExtractUserIdFromReq {

    extractUserId(req: Request) {
        if (!req.user) {
            throw new UserIdError('Unauthorized request for token');
        }
        return (
            req.user.sub
        );
    }
}