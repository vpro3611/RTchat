import { LoginEmailUseCase } from "../../../src/modules/users/application/login_email_use_case";
import {
    InvalidCredentialsError,
    UserNotFoundError
} from "../../../src/modules/users/errors/use_case_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("LoginEmailUseCase", () => {
    let reader: any;
    let bcrypt: any;
    let useCase: LoginEmailUseCase;
    let user: User;

    const validEmail = "test@example.com";
    const validPassword = "Str0ng_P@ss1!"; // соответствует твоему regex
    const wrongPassword = "Wrong_P@ss9!";

    beforeEach(() => {
        reader = {
            getUserByEmail: jest.fn(),
        };

        bcrypt = {
            compare: jest.fn(),
        };

        useCase = new LoginEmailUseCase(reader, bcrypt);

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "username",
            validEmail,
            "hashedPassword",
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should login successfully", async () => {
        reader.getUserByEmail.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);

        const result = await useCase.loginByEmailUseCase(
            validEmail,
            validPassword
        );

        expect(reader.getUserByEmail).toHaveBeenCalledWith(validEmail);
        expect(bcrypt.compare).toHaveBeenCalledWith(
            validPassword,
            "hashedPassword"
        );
        expect(result).toBeDefined();
    });

    it("should throw if user not found", async () => {
        reader.getUserByEmail.mockResolvedValue(null);

        await expect(
            useCase.loginByEmailUseCase(validEmail, validPassword)
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("should throw if password does not match", async () => {
        reader.getUserByEmail.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            useCase.loginByEmailUseCase(validEmail, wrongPassword)
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            "username",
            validEmail,
            "hashedPassword",
            false,
            new Date(),
            new Date(),
            new Date()
        );

        reader.getUserByEmail.mockResolvedValue(inactiveUser);

        await expect(
            useCase.loginByEmailUseCase(validEmail, validPassword)
        ).rejects.toThrow();
    });

    it("should throw if email is invalid", async () => {
        await expect(
            useCase.loginByEmailUseCase("invalid-email", validPassword)
        ).rejects.toThrow();
    });

    it("should throw if password is invalid", async () => {
        await expect(
            useCase.loginByEmailUseCase(validEmail, "short")
        ).rejects.toThrow();
    });
});