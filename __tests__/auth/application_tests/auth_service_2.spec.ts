import { AuthService } from "../../../src/modules/authentification/auth_service";
import { RegisterUseCase } from "../../../src/modules/users/application/register_use_case";
import { LoginUsernameUseCase } from "../../../src/modules/users/application/login_username_use_case";
import { LoginEmailUseCase } from "../../../src/modules/users/application/login_email_use_case";
import { RefreshTokenRepoPg } from "../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg";

jest.mock("../../../src/modules/users/application/register_use_case");
jest.mock("../../../src/modules/users/application/login_username_use_case");
jest.mock("../../../src/modules/users/application/login_email_use_case");
jest.mock("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");

describe("AuthService - register & login", () => {
    let jwtService: any;
    let txManager: any;
    let service: AuthService;

    let refreshRepoMock: any;

    beforeEach(() => {
        refreshRepoMock = {
            create: jest.fn(),
        };

        (RefreshTokenRepoPg as jest.Mock).mockImplementation(() => refreshRepoMock);

        jwtService = {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
        };

        txManager = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };

        service = new AuthService({} as any, jwtService, txManager);
    });

    // ============================
    // REGISTER
    // ============================

    it("should register user successfully", async () => {
        const userMock = { id: "user-id" };

        (RegisterUseCase as jest.Mock).mockImplementation(() => ({
            registerUseCase: jest.fn().mockResolvedValue(userMock),
        }));

        const result = await service.register("user", "mail@test.com", "Pass123!");

        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(result).toEqual({ user: userMock });
    });

    it("should propagate register error", async () => {
        (RegisterUseCase as jest.Mock).mockImplementation(() => ({
            registerUseCase: jest.fn().mockRejectedValue(new Error("fail")),
        }));

        await expect(
            service.register("u", "m@test.com", "Pass123!")
        ).rejects.toThrow("fail");
    });

    // ============================
    // LOGIN USERNAME
    // ============================

    it("should login by username and return tokens", async () => {
        const userMock = { id: "user-id" };

        (LoginUsernameUseCase as jest.Mock).mockImplementation(() => ({
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
        (LoginUsernameUseCase as jest.Mock).mockImplementation(() => ({
            loginByUsernameUseCase: jest.fn().mockRejectedValue(new Error("login error")),
        }));

        await expect(
            service.loginByUsername("user", "Pass123!")
        ).rejects.toThrow("login error");
    });

    // ============================
    // LOGIN EMAIL
    // ============================

    it("should login by email and return tokens", async () => {
        const userMock = { id: "user-id" };

        (LoginEmailUseCase as jest.Mock).mockImplementation(() => ({
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
        (LoginEmailUseCase as jest.Mock).mockImplementation(() => ({
            loginByEmailUseCase: jest.fn().mockRejectedValue(new Error("login error")),
        }));

        await expect(
            service.loginByEmail("mail@test.com", "Pass123!")
        ).rejects.toThrow("login error");
    });
});