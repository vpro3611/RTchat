import { LoginGoogleUseCase } from "../../../src/modules/users/application/login_google_use_case";
import { User } from "../../../src/modules/users/domain/user";

describe("LoginGoogleUseCase", () => {
    let userRepoReader: any;
    let mapper: any;
    let googleAuthService: any;
    let tokenService: any;
    let useCase: LoginGoogleUseCase;
    let user: User;

    const validIdToken = "valid-google-id-token";
    const googleEmail = "google-user@example.com";

    beforeEach(() => {
        userRepoReader = {
            getUserByEmail: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        googleAuthService = {
            verifyIdToken: jest.fn(),
        };

        tokenService = {
            generateRegistrationToken: jest.fn(),
        };

        useCase = new LoginGoogleUseCase(
            userRepoReader,
            mapper,
            googleAuthService,
            tokenService
        );

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "username",
            googleEmail,
            "hashedPassword",
            true,
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should login successfully if user exists", async () => {
        googleAuthService.verifyIdToken.mockResolvedValue(googleEmail);
        userRepoReader.getUserByEmail.mockResolvedValue(user);
        mapper.mapToDto.mockReturnValue({ id: user.id });

        const result = await useCase.loginGoogleUseCase(validIdToken);

        expect(googleAuthService.verifyIdToken).toHaveBeenCalledWith(validIdToken);
        expect(userRepoReader.getUserByEmail).toHaveBeenCalledWith(googleEmail);
        expect(mapper.mapToDto).toHaveBeenCalledWith(user);
        expect(result).toEqual({ user: { id: user.id }, registrationToken: null });
    });

    it("should return a registration token if user does not exist", async () => {
        googleAuthService.verifyIdToken.mockResolvedValue(googleEmail);
        userRepoReader.getUserByEmail.mockResolvedValue(null);
        tokenService.generateRegistrationToken.mockReturnValue("reg-token");

        const result = await useCase.loginGoogleUseCase(validIdToken);

        expect(googleAuthService.verifyIdToken).toHaveBeenCalledWith(validIdToken);
        expect(userRepoReader.getUserByEmail).toHaveBeenCalledWith(googleEmail);
        expect(tokenService.generateRegistrationToken).toHaveBeenCalledWith(googleEmail);
        expect(result).toEqual({ user: null, registrationToken: "reg-token" });
    });

    it("should throw if google auth fails", async () => {
        googleAuthService.verifyIdToken.mockRejectedValue(new Error("Invalid token"));

        await expect(
            useCase.loginGoogleUseCase(validIdToken)
        ).rejects.toThrow("Invalid token");

        expect(userRepoReader.getUserByEmail).not.toHaveBeenCalled();
    });

    it("should throw if user cannot login (e.g., inactive)", async () => {
        const inactiveUser = User.restore(
            user.id,
            "username",
            googleEmail,
            "hashedPassword",
            false,
            true,
            new Date(),
            new Date(),
            new Date()
        );

        googleAuthService.verifyIdToken.mockResolvedValue(googleEmail);
        userRepoReader.getUserByEmail.mockResolvedValue(inactiveUser);

        await expect(
            useCase.loginGoogleUseCase(validIdToken)
        ).rejects.toThrow();

        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });
});
