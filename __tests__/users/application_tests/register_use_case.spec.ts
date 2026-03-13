import { RegisterUseCase } from "../../../src/modules/users/application/register_use_case";
import { UsernameAlreadyExistsError } from "../../../src/modules/users/errors/username_errors";
import { EmailAlreadyExistsError } from "../../../src/modules/users/errors/email_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("RegisterUseCase", () => {
    let reader: any;
    let writer: any;
    let bcrypter: any;
    let emailSender: any;
    let emailVerificationRepo: any;
    let mapper: any;
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

        bcrypter = {
            hash: jest.fn(),
        };

        emailSender = {
            sendVerificationEmail: jest.fn(),
        };

        emailVerificationRepo = {
            saveToken: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        useCase = new RegisterUseCase(
            reader,
            writer,
            bcrypter,
            emailSender,
            emailVerificationRepo,
            mapper
        );
    });

    it("should register successfully", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);
        bcrypter.hash.mockResolvedValue("hashedPassword");

        writer.save.mockImplementation(async (user: User) => user);

        emailVerificationRepo.saveToken.mockResolvedValue(undefined);
        emailSender.sendVerificationEmail.mockResolvedValue(undefined);

        mapper.mapToDto.mockReturnValue({ id: "user-id" });

        const result = await useCase.registerUseCase(
            validUsername,
            validEmail,
            validPassword
        );

        expect(reader.getUserByUsername).toHaveBeenCalledWith(validUsername);
        expect(reader.getUserByEmail).toHaveBeenCalledWith(validEmail);

        expect(bcrypter.hash).toHaveBeenCalledWith(validPassword);

        expect(writer.save).toHaveBeenCalled();

        expect(emailVerificationRepo.saveToken).toHaveBeenCalled();
        expect(emailSender.sendVerificationEmail).toHaveBeenCalled();

        expect(mapper.mapToDto).toHaveBeenCalled();
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw if username already exists", async () => {
        reader.getUserByUsername.mockResolvedValue({});

        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);

        expect(writer.save).not.toHaveBeenCalled();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });

    it("should throw if email already exists", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue({});

        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

        expect(writer.save).not.toHaveBeenCalled();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });

    it("should throw if username is invalid", async () => {
        await expect(
            useCase.registerUseCase(
                "ab",
                validEmail,
                validPassword
            )
        ).rejects.toThrow();

        expect(bcrypter.hash).not.toHaveBeenCalled();
    });

    it("should throw if email is invalid", async () => {
        await expect(
            useCase.registerUseCase(
                validUsername,
                "invalid-email",
                validPassword
            )
        ).rejects.toThrow();

        expect(bcrypter.hash).not.toHaveBeenCalled();
    });

    it("should throw if password is invalid", async () => {
        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                "short"
            )
        ).rejects.toThrow();

        expect(bcrypter.hash).not.toHaveBeenCalled();
    });

    it("should propagate bcrypt error", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);

        bcrypter.hash.mockRejectedValue(new Error("bcrypt error"));

        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toThrow("bcrypt error");

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should propagate email verification repo error", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);
        bcrypter.hash.mockResolvedValue("hashedPassword");

        writer.save.mockImplementation(async (user: User) => user);

        emailVerificationRepo.saveToken.mockRejectedValue(
            new Error("verification error")
        );

        await expect(
            useCase.registerUseCase(
                validUsername,
                validEmail,
                validPassword
            )
        ).rejects.toThrow("verification error");

        expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    });
});