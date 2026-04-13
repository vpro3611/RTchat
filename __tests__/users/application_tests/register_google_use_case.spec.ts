import { RegisterGoogleUseCase } from "../../../src/modules/users/application/register_google_use_case";
import { UsernameAlreadyExistsError } from "../../../src/modules/users/errors/username_errors";
import { EmailAlreadyExistsError } from "../../../src/modules/users/errors/email_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("RegisterGoogleUseCase", () => {
    let userRepoReader: any;
    let userRepoWriter: any;
    let bcrypter: any;
    let mapper: any;
    let tokenService: any;
    let useCase: RegisterGoogleUseCase;

    const validUsername = "googleuser";
    const googleEmail = "google-user@example.com";
    const validPassword = "Str0ng_P@ss1!long";
    const registrationToken = "valid-registration-token";

    beforeEach(() => {
        userRepoReader = {
            getUserByUsername: jest.fn(),
            getUserByEmail: jest.fn(),
            getUserById: jest.fn(),
        };

        userRepoWriter = {
            save: jest.fn(),
            markAsVerified: jest.fn(),
        };

        bcrypter = {
            hash: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        tokenService = {
            verifyRegistrationToken: jest.fn(),
        };

        useCase = new RegisterGoogleUseCase(
            userRepoReader,
            userRepoWriter,
            bcrypter,
            mapper,
            tokenService
        );
    });

    it("should register google user successfully", async () => {
        tokenService.verifyRegistrationToken.mockReturnValue({ email: googleEmail });
        userRepoReader.getUserByUsername.mockResolvedValue(null);
        userRepoReader.getUserByEmail.mockResolvedValue(null);
        bcrypter.hash.mockResolvedValue("hashedPassword");

        const mockUser = { id: "user-id" };
        userRepoWriter.save.mockResolvedValue(mockUser);
        userRepoWriter.markAsVerified.mockResolvedValue(undefined);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        mapper.mapToDto.mockReturnValue({ id: "user-id", email: googleEmail });

        const result = await useCase.registerGoogleUseCase(
            validUsername,
            validPassword,
            registrationToken
        );

        expect(tokenService.verifyRegistrationToken).toHaveBeenCalledWith(registrationToken);
        expect(userRepoReader.getUserByUsername).toHaveBeenCalledWith(validUsername);
        expect(userRepoReader.getUserByEmail).toHaveBeenCalledWith(googleEmail);
        expect(bcrypter.hash).toHaveBeenCalledWith(validPassword);
        expect(userRepoWriter.save).toHaveBeenCalled();
        expect(userRepoWriter.markAsVerified).toHaveBeenCalledWith("user-id");
        expect(result).toEqual({ id: "user-id", email: googleEmail });
    });

    it("should throw if registration token is invalid", async () => {
        tokenService.verifyRegistrationToken.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        await expect(
            useCase.registerGoogleUseCase(
                validUsername,
                validPassword,
                registrationToken
            )
        ).rejects.toThrow("Invalid token");

        expect(userRepoReader.getUserByUsername).not.toHaveBeenCalled();
    });

    it("should throw if username already exists", async () => {
        tokenService.verifyRegistrationToken.mockReturnValue({ email: googleEmail });
        userRepoReader.getUserByUsername.mockResolvedValue({});

        await expect(
            useCase.registerGoogleUseCase(
                validUsername,
                validPassword,
                registrationToken
            )
        ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);

        expect(userRepoWriter.save).not.toHaveBeenCalled();
    });

    it("should throw if email already exists", async () => {
        tokenService.verifyRegistrationToken.mockReturnValue({ email: googleEmail });
        userRepoReader.getUserByUsername.mockResolvedValue(null);
        userRepoReader.getUserByEmail.mockResolvedValue({});

        await expect(
            useCase.registerGoogleUseCase(
                validUsername,
                validPassword,
                registrationToken
            )
        ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

        expect(userRepoWriter.save).not.toHaveBeenCalled();
    });

    it("should throw if password is invalid", async () => {
        tokenService.verifyRegistrationToken.mockReturnValue({ email: googleEmail });
        
        await expect(
            useCase.registerGoogleUseCase(
                validUsername,
                "short",
                registrationToken
            )
        ).rejects.toThrow();

        expect(bcrypter.hash).not.toHaveBeenCalled();
    });
});
