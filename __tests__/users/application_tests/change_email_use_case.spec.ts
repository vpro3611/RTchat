import { ChangeEmailUseCase } from "../../../src/modules/users/application/change_email_use_case";
import { EmailAlreadyExistsError } from "../../../src/modules/users/errors/email_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangeEmailUseCase", () => {
    let reader: any;
    let writer: any;
    let mapper: any;
    let userLookup: any;
    let useCase: ChangeEmailUseCase;
    let user: User;

    beforeEach(() => {
        reader = {
            getUserByEmail: jest.fn(),
        };

        writer = {
            save: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        userLookup = {
            getUserOrThrow: jest.fn(),
        };

        useCase = new ChangeEmailUseCase(
            reader,
            writer,
            mapper,
            userLookup
        );

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "testuser",
            "old@example.com",
            "hash",
            true,
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should change email successfully", async () => {
        userLookup.getUserOrThrow.mockResolvedValue(user);
        reader.getUserByEmail.mockResolvedValue(null);
        writer.save.mockResolvedValue(user);

        mapper.mapToDto.mockReturnValue({
            id: user.id,
            email: "new@example.com",
        });

        const result = await useCase.changeEmailUseCase(
            user.id,
            "new@example.com"
        );

        expect(reader.getUserByEmail)
            .toHaveBeenCalledWith("new@example.com");

        expect(writer.save).toHaveBeenCalledWith(user);

        expect(mapper.mapToDto).toHaveBeenCalledWith(user);

        expect(user.getEmail().getValue())
            .toBe("new@example.com");

        expect(result).toEqual({
            id: user.id,
            email: "new@example.com",
        });
    });

    it("should throw if email already exists", async () => {
        userLookup.getUserOrThrow.mockResolvedValue(user);
        reader.getUserByEmail.mockResolvedValue({});

        await expect(
            useCase.changeEmailUseCase(user.id, "existing@example.com")
        ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

        expect(writer.save).not.toHaveBeenCalled();
        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            "testuser",
            "old@example.com",
            "hash",
            false,
            true,
            new Date(),
            new Date(),
            new Date()
        );

        userLookup.getUserOrThrow.mockResolvedValue(inactiveUser);
        reader.getUserByEmail.mockResolvedValue(null);

        await expect(
            useCase.changeEmailUseCase(user.id, "new@example.com")
        ).rejects.toThrow();

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if user is not verified", async () => {
        const notVerifiedUser = User.restore(
            user.id,
            "testuser",
            "old@example.com",
            "hash",
            true,
            false,
            new Date(),
            new Date(),
            new Date()
        );

        userLookup.getUserOrThrow.mockResolvedValue(notVerifiedUser);
        reader.getUserByEmail.mockResolvedValue(null);

        await expect(
            useCase.changeEmailUseCase(user.id, "new@example.com")
        ).rejects.toThrow();

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if email is invalid", async () => {
        await expect(
            useCase.changeEmailUseCase(user.id, "invalid-email")
        ).rejects.toThrow();

        expect(userLookup.getUserOrThrow).not.toHaveBeenCalled();
    });

    it("should propagate lookup error", async () => {
        userLookup.getUserOrThrow.mockRejectedValue(
            new Error("USER_NOT_FOUND")
        );

        await expect(
            useCase.changeEmailUseCase(user.id, "new@example.com")
        ).rejects.toThrow("USER_NOT_FOUND");

        expect(writer.save).not.toHaveBeenCalled();
    });
});