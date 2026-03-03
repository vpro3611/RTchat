import { ChangePasswordUseCase } from "../../../src/modules/users/application/change_password_use_case";
import { InvalidCredentialsError, OldPasswordNotMatchError } from "../../../src/modules/users/errors/use_case_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangePasswordUseCase", () => {
    let reader: any;
    let writer: any;
    let bcrypt: any;
    let useCase: ChangePasswordUseCase;
    let user: User;

    const validOldPassword = "Str0ng_P@ss1!";
    const validNewPassword = "NewStr0ng_P@ss2!";
    const wrongPassword = "Wrong_P@ss9!";

    beforeEach(() => {
        reader = {
            getUserById: jest.fn(),
        };

        writer = {
            save: jest.fn(),
        };

        bcrypt = {
            compare: jest.fn(),
            hash: jest.fn(),
        };

        useCase = new ChangePasswordUseCase(reader, writer, bcrypt);

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "testuser",
            "test@example.com",
            "hashedOldPassword",
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should change password successfully", async () => {
        reader.getUserById.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue("newHashedPassword");
        writer.save.mockResolvedValue(user);

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
        expect(writer.save).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it("should throw if old and new passwords are equal", async () => {
        await expect(
            useCase.changePasswordUseCase(
                user.id,
                validOldPassword,
                validOldPassword
            )
        ).rejects.toBeInstanceOf(OldPasswordNotMatchError);
    });

    it("should throw if old password does not match", async () => {
        reader.getUserById.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            useCase.changePasswordUseCase(
                user.id,
                wrongPassword,
                validNewPassword
            )
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            "testuser",
            "test@example.com",
            "hashedOldPassword",
            false,
            new Date(),
            new Date(),
            new Date()
        );

        reader.getUserById.mockResolvedValue(inactiveUser);

        await expect(
            useCase.changePasswordUseCase(
                user.id,
                validOldPassword,
                validNewPassword
            )
        ).rejects.toThrow();
    });
});