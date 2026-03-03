import { RegisterUseCase } from "../../../src/modules/users/application/register_use_case";
import { UsernameAlreadyExistsError } from "../../../src/modules/users/errors/username_errors";
import { EmailAlreadyExistsError } from "../../../src/modules/users/errors/email_errors";
import {User} from "../../../src/modules/users/domain/user";

describe("RegisterUseCase", () => {
    let reader: any;
    let writer: any;
    let bcrypt: any;
    let useCase: RegisterUseCase;

    const validUsername = "testuser";
    const validEmail = "test@example.com";
    const validPassword = "Str0ng_P@ss1!";

    beforeEach(() => {
        reader = {
            getUserByUsername: jest.fn(),
            getUserByEmail: jest.fn(),
        };

        writer = {
            save: jest.fn(),
        };

        bcrypt = {
            hash: jest.fn(),
        };

        useCase = new RegisterUseCase(reader, writer, bcrypt);
    });

    it("should register successfully", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashedPassword");
        writer.save.mockImplementation(async (user: User) => user);

        const result = await useCase.registerUseCase(
            validUsername,
            validEmail,
            validPassword
        );

        expect(bcrypt.hash).toHaveBeenCalledWith(validPassword);
        expect(reader.getUserByUsername).toHaveBeenCalledWith(validUsername);
        expect(reader.getUserByEmail).toHaveBeenCalledWith(validEmail);
        expect(writer.save).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it("should throw if username already exists", async () => {
        reader.getUserByUsername.mockResolvedValue({}); // найден

        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if email already exists", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue({}); // найден

        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if username is invalid", async () => {
        await expect(
            useCase.registerUseCase(
                "ab", // слишком короткий
                validEmail,
                validPassword
            )
        ).rejects.toThrow();

        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should throw if email is invalid", async () => {
        await expect(
            useCase.registerUseCase(
                validUsername,
                "invalid-email",
                validPassword
            )
        ).rejects.toThrow();

        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should throw if password is invalid", async () => {
        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                "short"
            )
        ).rejects.toThrow();

        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should throw if password is invalid by bcrypt", async () => {
        bcrypt.hash.mockRejectedValue(new Error("bcrypt error"));
        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toThrow();
        expect(bcrypt.hash).toHaveBeenCalledWith(validPassword);
    })
});