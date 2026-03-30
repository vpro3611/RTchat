import { ChangePasswordUseCase } from "../../../src/modules/users/application/change_password_use_case";
import {
    InvalidCredentialsError,
    OldPasswordNotMatchError
} from "../../../src/modules/users/errors/use_case_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangePasswordUseCase", () => {
    let writer: any;
    let bcrypt: any;
    let mapper: any;
    let userLookup: any;
    let useCase: ChangePasswordUseCase;
    let user: User;

    const validOldPassword = "Str0ng_P@ss1!";
    const validNewPassword = "NewStr0ng_P@ss2!";
    const wrongPassword = "Wrong_P@ss9!";

    beforeEach(() => {
        writer = {
            save: jest.fn(),
        };

        bcrypt = {
            compare: jest.fn(),
            hash: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        userLookup = {
            getUserOrThrow: jest.fn(),
        };

        useCase = new ChangePasswordUseCase(
            {} as any, // userRepoReader больше не используется напрямую
            writer,
            bcrypt,
            mapper,
            userLookup
        );

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "testuser",
            "test@example.com",
            "hashedOldPassword",
            true,
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should change password successfully", async () => {
        userLookup.getUserOrThrow.mockResolvedValue(user);

        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue("newHashedPassword");

        writer.save.mockResolvedValue(user);

        mapper.mapToDto.mockReturnValue({ id: user.id });

        const result = await useCase.changePasswordUseCase(
            user.id,
            validOldPassword,
            validNewPassword
        );

        expect(bcrypt.compare).toHaveBeenCalledWith(
            validOldPassword,
            "hashedOldPassword"
        );

        expect(bcrypt.hash).toHaveBeenCalledWith(validNewPassword);

        expect(writer.save).toHaveBeenCalledWith(user);

        expect(mapper.mapToDto).toHaveBeenCalledWith(user);

        expect(result).toEqual({ id: user.id });
    });

    it("should throw if old and new passwords are equal", async () => {
        await expect(
            useCase.changePasswordUseCase(
                user.id,
                validOldPassword,
                validOldPassword
            )
        ).rejects.toBeInstanceOf(OldPasswordNotMatchError);

        expect(userLookup.getUserOrThrow).not.toHaveBeenCalled();
    });

    it("should throw if old password does not match", async () => {
        userLookup.getUserOrThrow.mockResolvedValue(user);

        bcrypt.compare.mockResolvedValue(false);

        await expect(
            useCase.changePasswordUseCase(
                user.id,
                wrongPassword,
                validNewPassword
            )
        ).rejects.toBeInstanceOf(InvalidCredentialsError);

        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            "testuser",
            "test@example.com",
            "hashedOldPassword",
            false,
            true,
            new Date(),
            new Date(),
            new Date()
        );

        userLookup.getUserOrThrow.mockResolvedValue(inactiveUser);

        await expect(
            useCase.changePasswordUseCase(
                user.id,
                validOldPassword,
                validNewPassword
            )
        ).rejects.toThrow();

        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw if user is not verified", async () => {
        const notVerifiedUser = User.restore(
            user.id,
            "testuser",
            "test@example.com",
            "hashedOldPassword",
            true,
            false,
            new Date(),
            new Date(),
            new Date()
        );

        userLookup.getUserOrThrow.mockResolvedValue(notVerifiedUser);

        await expect(
            useCase.changePasswordUseCase(
                user.id,
                validOldPassword,
                validNewPassword
            )
        ).rejects.toThrow();

        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw if password validation fails", async () => {
        await expect(
            useCase.changePasswordUseCase(
                user.id,
                "short",
                validNewPassword
            )
        ).rejects.toThrow();

        expect(userLookup.getUserOrThrow).not.toHaveBeenCalled();
    });

    it("should propagate lookup error", async () => {
        userLookup.getUserOrThrow.mockRejectedValue(
            new Error("USER_NOT_FOUND")
        );

        await expect(
            useCase.changePasswordUseCase(
                user.id,
                validOldPassword,
                validNewPassword
            )
        ).rejects.toThrow("USER_NOT_FOUND");

        expect(writer.save).not.toHaveBeenCalled();
    });
});