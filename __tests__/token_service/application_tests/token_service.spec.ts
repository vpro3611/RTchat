import { TokenServiceJWT } from "../../../src/modules/authentification/jwt_token_service/token_service";
import { InvalidTokenJWTError, SecretNotDefinedError } from "../../../src/modules/authentification/errors/token_errors";

describe("TokenServiceJWT", () => {
    const userId = "11111111-1111-1111-1111-111111111111";

    let service: TokenServiceJWT;

    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };

        process.env.ACCESS_TOKEN_SECRET = "access_secret";
        process.env.REFRESH_TOKEN_SECRET = "refresh_secret";
        process.env.NODE_ENV = "test";

        service = new TokenServiceJWT();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    // ---------------------------
    // GENERATION
    // ---------------------------

    it("should generate access token", () => {
        const token = service.generateAccessToken(userId);

        expect(typeof token).toBe("string");
    });

    it("should generate refresh token", () => {
        const token = service.generateRefreshToken(userId);

        expect(typeof token).toBe("string");
    });

    // ---------------------------
    // VERIFY SUCCESS
    // ---------------------------

    it("should verify access token successfully", () => {
        const token = service.generateAccessToken(userId);

        const payload = service.verifyAccessToken(token);

        expect(payload.sub).toBe(userId);
    });

    it("should verify refresh token successfully", () => {
        const token = service.generateRefreshToken(userId);

        const payload = service.verifyRefreshToken(token);

        expect(payload.sub).toBe(userId);
    });

    // ---------------------------
    // INVALID TOKEN
    // ---------------------------

    it("should throw InvalidTokenJWTError for invalid access token", () => {
        expect(() =>
            service.verifyAccessToken("invalid.token.here")
        ).toThrow(InvalidTokenJWTError);
    });

    it("should throw InvalidTokenJWTError for invalid refresh token", () => {
        expect(() =>
            service.verifyRefreshToken("invalid.token.here")
        ).toThrow(InvalidTokenJWTError);
    });

    // ---------------------------
    // SECRET NOT DEFINED
    // ---------------------------

    it("should throw if ACCESS_TOKEN_SECRET not defined", () => {
        delete process.env.ACCESS_TOKEN_SECRET;

        expect(() =>
            service.generateAccessToken(userId)
        ).toThrow(SecretNotDefinedError);
    });

    it("should throw if REFRESH_TOKEN_SECRET not defined", () => {
        delete process.env.REFRESH_TOKEN_SECRET;

        expect(() =>
            service.generateRefreshToken(userId)
        ).toThrow(SecretNotDefinedError);
    });

    // ---------------------------
    // ERROR MESSAGE IN NON-PRODUCTION
    // ---------------------------

    it("should include original error message in non-production", () => {
        process.env.NODE_ENV = "development";

        expect(() =>
            service.verifyAccessToken("invalid.token")
        ).toThrow(/Invalid access token/);
    });

    // ---------------------------
    // PRODUCTION MODE
    // ---------------------------

    it("should not leak original error in production", () => {
        process.env.NODE_ENV = "production";

        expect(() =>
            service.verifyAccessToken("invalid.token")
        ).toThrow("Invalid access token");
    });
});