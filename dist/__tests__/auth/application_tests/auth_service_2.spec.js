"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../../src/modules/authentification/auth_service");
const register_use_case_1 = require("../../../src/modules/users/application/register_use_case");
const login_username_use_case_1 = require("../../../src/modules/users/application/login_username_use_case");
const login_email_use_case_1 = require("../../../src/modules/users/application/login_email_use_case");
const refresh_token_repo_pg_1 = require("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");
jest.mock("../../../src/modules/users/application/register_use_case");
jest.mock("../../../src/modules/users/application/login_username_use_case");
jest.mock("../../../src/modules/users/application/login_email_use_case");
jest.mock("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");
describe("AuthService - register & login", () => {
    let jwtService;
    let txManager;
    let service;
    let refreshRepoMock;
    beforeEach(() => {
        refreshRepoMock = {
            create: jest.fn(),
        };
        refresh_token_repo_pg_1.RefreshTokenRepoPg.mockImplementation(() => refreshRepoMock);
        jwtService = {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
        };
        txManager = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };
        service = new auth_service_1.AuthService({}, jwtService, txManager);
    });
    // ============================
    // REGISTER
    // ============================
    it("should register user successfully", async () => {
        const userMock = { id: "user-id" };
        register_use_case_1.RegisterUseCase.mockImplementation(() => ({
            registerUseCase: jest.fn().mockResolvedValue(userMock),
        }));
        const result = await service.register("user", "mail@test.com", "Pass123!");
        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(result).toEqual({ user: userMock });
    });
    it("should propagate register error", async () => {
        register_use_case_1.RegisterUseCase.mockImplementation(() => ({
            registerUseCase: jest.fn().mockRejectedValue(new Error("fail")),
        }));
        await expect(service.register("u", "m@test.com", "Pass123!")).rejects.toThrow("fail");
    });
    // ============================
    // LOGIN USERNAME
    // ============================
    it("should login by username and return tokens", async () => {
        const userMock = { id: "user-id" };
        login_username_use_case_1.LoginUsernameUseCase.mockImplementation(() => ({
            loginByUsernameUseCase: jest.fn().mockResolvedValue(userMock),
        }));
        jwtService.generateAccessToken.mockReturnValue("access");
        jwtService.generateRefreshToken.mockReturnValue("refresh");
        const result = await service.loginByUsername("user", "Pass123!");
        expect(result).toEqual({
            user: userMock,
            accessToken: "access",
            refreshToken: "refresh",
        });
        expect(refreshRepoMock.create).toHaveBeenCalled();
    });
    it("should propagate loginByUsername error", async () => {
        login_username_use_case_1.LoginUsernameUseCase.mockImplementation(() => ({
            loginByUsernameUseCase: jest.fn().mockRejectedValue(new Error("login error")),
        }));
        await expect(service.loginByUsername("user", "Pass123!")).rejects.toThrow("login error");
    });
    // ============================
    // LOGIN EMAIL
    // ============================
    it("should login by email and return tokens", async () => {
        const userMock = { id: "user-id" };
        login_email_use_case_1.LoginEmailUseCase.mockImplementation(() => ({
            loginByEmailUseCase: jest.fn().mockResolvedValue(userMock),
        }));
        jwtService.generateAccessToken.mockReturnValue("access");
        jwtService.generateRefreshToken.mockReturnValue("refresh");
        const result = await service.loginByEmail("mail@test.com", "Pass123!");
        expect(result).toEqual({
            user: userMock,
            accessToken: "access",
            refreshToken: "refresh",
        });
        expect(refreshRepoMock.create).toHaveBeenCalled();
    });
    it("should propagate loginByEmail error", async () => {
        login_email_use_case_1.LoginEmailUseCase.mockImplementation(() => ({
            loginByEmailUseCase: jest.fn().mockRejectedValue(new Error("login error")),
        }));
        await expect(service.loginByEmail("mail@test.com", "Pass123!")).rejects.toThrow("login error");
    });
});
