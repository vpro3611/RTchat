import { AuthService } from "../../../src/modules/authentification/auth_service";
import { InvalidTokenJWTError, TokenExpiredError } from "../../../src/modules/authentification/errors/token_errors";
import { RefreshTokenRepoPg } from "../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg";

jest.mock("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");

describe("AuthService", () => {
    let jwtService: any;
    let txManager: any;
    let service: AuthService;

    let refreshRepoMock: any;

    beforeEach(() => {
        refreshRepoMock = {
            findValidByHash: jest.fn(),
            revoke: jest.fn(),
            revokeByHash: jest.fn(),
            create: jest.fn(),
        };

        (RefreshTokenRepoPg as jest.Mock).mockImplementation(() => refreshRepoMock);

        jwtService = {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
        };

        txManager = {
            runInTransaction: jest.fn(async (callback) => {
                return callback({}); // fake client
            }),
        };

        service = new AuthService({} as any, jwtService, txManager);
    });

    // ============================
    // refresh SUCCESS
    // ============================

    it("should refresh tokens successfully", async () => {
        jwtService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });

        refreshRepoMock.findValidByHash.mockResolvedValue({
            id: "token-id",
            expiresAt: new Date(Date.now() + 10000),
        });

        jwtService.generateAccessToken.mockReturnValue("newAccess");
        jwtService.generateRefreshToken.mockReturnValue("newRefresh");

        const result = await service.refresh("refreshToken");

        expect(refreshRepoMock.findValidByHash).toHaveBeenCalled();
        expect(refreshRepoMock.revoke).toHaveBeenCalledWith("token-id");

        expect(result).toEqual({
            accessToken: "newAccess",
            refreshToken: "newRefresh",
        });
    });

    // ============================
    // invalid
    // ============================

    it("should throw if refresh token not found", async () => {
        jwtService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });
        refreshRepoMock.findValidByHash.mockResolvedValue(null);

        await expect(service.refresh("bad"))
            .rejects.toBeInstanceOf(InvalidTokenJWTError);
    });

    it("should throw if refresh token expired", async () => {
        jwtService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });

        refreshRepoMock.findValidByHash.mockResolvedValue({
            id: "token-id",
            expiresAt: new Date(Date.now() - 1000),
        });

        await expect(service.refresh("expired"))
            .rejects.toBeInstanceOf(TokenExpiredError);
    });

    // ============================
    // logout
    // ============================

    it("should revoke by hash on logout", async () => {
        await service.logout("refreshToken");

        expect(refreshRepoMock.revokeByHash).toHaveBeenCalled();
    });

    // ============================
    // transaction used
    // ============================

    it("should execute inside transaction", async () => {
        jwtService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });

        refreshRepoMock.findValidByHash.mockResolvedValue({
            id: "id",
            expiresAt: new Date(Date.now() + 10000),
        });

        jwtService.generateAccessToken.mockReturnValue("a");
        jwtService.generateRefreshToken.mockReturnValue("r");

        await service.refresh("refresh");

        expect(txManager.runInTransaction).toHaveBeenCalled();
    });
});