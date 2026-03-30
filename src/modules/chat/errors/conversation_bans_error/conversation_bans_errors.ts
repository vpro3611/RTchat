import {ConflictError} from "../../../../http_errors_base";


export class NotBannedError extends ConflictError {
    constructor(message: string) {
        super(message);
    }
}