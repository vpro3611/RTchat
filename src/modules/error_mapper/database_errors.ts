import {InternalServerError} from "../../http_errors_base";


export class CustomDatabaseError extends InternalServerError {
    constructor(message: string) {
        super(message);
    }
}