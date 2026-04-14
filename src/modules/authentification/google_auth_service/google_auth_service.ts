import {GoogleAuthServiceInterface} from "../ports/google_auth_service_interface";
import {OAuth2Client} from "google-auth-library";
import {InvalidTokenJWTError} from "../errors/token_errors";

export class GoogleAuthService implements GoogleAuthServiceInterface {
    private client: OAuth2Client;

    constructor(private readonly clientId: string) {
        this.client = new OAuth2Client(clientId);
    }

    async verifyIdToken(idToken: string): Promise<string> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: idToken,
                audience: this.clientId,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new InvalidTokenJWTError("Invalid Google ID token payload or missing email");
            }
            return payload.email;
        } catch (e: any) {
            throw new InvalidTokenJWTError("Failed to verify Google ID token");
        }
    }
}