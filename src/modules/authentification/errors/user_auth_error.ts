import {AuthentificationError} from "../../../http_errors_base";

export class UserIdError extends AuthentificationError {
    constructor(message: string) {
        super(message);
    }
}