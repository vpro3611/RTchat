import {AccessTokenPayload} from "./modules/authentification/payloads/payloads";

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}