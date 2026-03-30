"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../../src/modules/authentification/auth_service");
const token_errors_1 = require("../../../src/modules/authentification/errors/token_errors");
const refresh_token_repo_pg_1 = require("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");
jest.mock("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");
describe("AuthService", () => {
    let jwtService;
    let txManager;
    let service;
    let refreshRepoMock;
    beforeEach(() => {
        refreshRepoMock = {
            findValidByHash: jest.fn(),
            revoke: jest.fn(),
            revokeByHash: jest.fn(),
            create: jest.fn(),
        };
        refresh_token_repo_pg_1.RefreshTokenRepoPg.mockImplementation(() => refreshRepoMock);
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
        service = new auth_service_1.AuthService({}, jwtService, txManager);
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
            .rejects.toBeInstanceOf(token_errors_1.InvalidTokenJWTError);
    });
    it("should throw if refresh token expired", async () => {
        jwtService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });
        refreshRepoMock.findValidByHash.mockResolvedValue({
            id: "token-id",
            expiresAt: new Date(Date.now() - 1000),
        });
        await expect(service.refresh("expired"))
            .rejects.toBeInstanceOf(token_errors_1.TokenExpiredError);
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
