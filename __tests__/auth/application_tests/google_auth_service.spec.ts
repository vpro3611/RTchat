import { GoogleAuthService } from "../../../src/modules/authentification/google_auth_service/google_auth_service";
import { OAuth2Client } from "google-auth-library";

jest.mock("google-auth-library");

describe("GoogleAuthService", () => {
    let googleAuthService: GoogleAuthService;
    let mockOAuth2Client: jest.Mocked<OAuth2Client>;
    const clientId = "test-client-id";

    beforeEach(() => {
        mockOAuth2Client = new OAuth2Client() as jest.Mocked<OAuth2Client>;
        (OAuth2Client as unknown as jest.Mock).mockReturnValue(mockOAuth2Client);
        googleAuthService = new GoogleAuthService(clientId);
    });

    it("should verify id token and return email", async () => {
        const mockPayload = { email: "test@example.com" };
        const mockTicket = {
            getPayload: () => mockPayload
        };
        (mockOAuth2Client.verifyIdToken as jest.Mock).mockResolvedValue(mockTicket as any);

        const email = await googleAuthService.verifyIdToken("some-id-token");

        expect(email).toBe("test@example.com");
        expect(mockOAuth2Client.verifyIdToken).toHaveBeenCalledWith({
            idToken: "some-id-token",
            audience: clientId
        });
    });

    it("should throw if payload is missing email", async () => {
        const mockPayload = {};
        const mockTicket = {
            getPayload: () => mockPayload
        };
        (mockOAuth2Client.verifyIdToken as jest.Mock).mockResolvedValue(mockTicket as any);

        await expect(googleAuthService.verifyIdToken("some-id-token")).rejects.toThrow(
            "Failed to verify Google ID token"
        );
    });

    it("should throw if verifyIdToken fails", async () => {
        (mockOAuth2Client.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Verification failed"));

        await expect(googleAuthService.verifyIdToken("some-id-token")).rejects.toThrow(
            "Failed to verify Google ID token"
        );
    });
});
