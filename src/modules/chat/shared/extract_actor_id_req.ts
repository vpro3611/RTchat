import {Request} from "express"
import {UserIdError} from "../../authentification/errors/user_auth_error";



export class ExtractActorId {
    extractActorId(req: Request) {
        if (!req.user) {
            throw new UserIdError("Fatal : User id not found in request")
        }
        return req.user
    }
}
