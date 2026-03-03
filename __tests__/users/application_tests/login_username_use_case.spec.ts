import { LoginUsernameUseCase } from "../../../src/modules/users/application/login_username_use_case";
import {
    InvalidCredentialsError,
    UserNotFoundError
} from "../../../src/modules/users/errors/use_case_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("LoginUsernameUseCase", () => {
    let reader: any;
    let bcrypt: any;
    let useCase: LoginUsernameUseCase;
    let user: User;

    const validUsername = "testuser";
    const validPassword = "Str0ng_P@ss1!";
    const wrongPassword = "Wrong_P@ss9!";

    beforeEach(() => {
        reader = {
            getUserByUsername: jest.fn(),
        };

        bcrypt = {
            compare: jest.fn(),
        };

        useCase = new LoginUsernameUseCase(reader, bcrypt);

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            validUsername,
            "test@example.com",
            "hashedPassword",
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should login successfully", async () => {
        reader.getUserByUsername.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);

        const result = await useCase.loginByUsernameUseCase(
            validUsername,
            validPassword
        );

        expect(reader.getUserByUsername).toHaveBeenCalledWith(validUsername);
        expect(bcrypt.compare).toHaveBeenCalledWith(
            validPassword,
            "hashedPassword"
        );
        expect(result).toBeDefined();
    });

    it("should throw if user not found", async () => {
        reader.getUserByUsername.mockResolvedValue(null);

        await expect(
            useCase.loginByUsernameUseCase(validUsername, validPassword)
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("should throw if password does not match", async () => {
        reader.getUserByUsername.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            useCase.loginByUsernameUseCase(validUsername, wrongPassword)
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            validUsername,
            "test@example.com",
            "hashedPassword",
            false,
            new Date(),
            new Date(),
            new Date()
        );

        reader.getUserByUsername.mockResolvedValue(inactiveUser);

        await expect(
            useCase.loginByUsernameUseCase(validUsername, validPassword)
        ).rejects.toThrow();
    });

    it("should throw if username is invalid", async () => {
        await expect(
            useCase.loginByUsernameUseCase("ab", validPassword)
        ).rejects.toThrow();
    });

    it("should throw if password is invalid", async () => {
        await expect(
            useCase.loginByUsernameUseCase(validUsername, "short")
        ).rejects.toThrow();
    });

    it("should not call bcrypt if username invalid", async () => {
        await expect(
            useCase.loginByUsernameUseCase("ab", validPassword)
        ).rejects.toThrow();

        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
});