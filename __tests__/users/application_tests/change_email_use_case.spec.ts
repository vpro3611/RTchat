import { ChangeEmailUseCase } from "../../../src/modules/users/application/change_email_use_case";
import { EmailAlreadyExistsError } from "../../../src/modules/users/errors/email_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangeEmailUseCase", () => {
    let reader: any;
    let writer: any;
    let mapper: any;
    let userLookup: any;
    let sendEmailVerifShared: any;
    let emailVerificationService: any;
    let useCase: ChangeEmailUseCase;
    let user: User;

    beforeEach(() => {
        reader = {
            getUserByEmail: jest.fn(),
        };

        writer = {
            save: jest.fn(),
            setPendingEmail: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        userLookup = {
            getUserOrThrow: jest.fn(),
        };

        sendEmailVerifShared = {
            sendIt: jest.fn(),
        };

        emailVerificationService = {
            deleteByUserIdAndType: jest.fn(),
        };

        useCase = new ChangeEmailUseCase(
            reader,
            writer,
            mapper,
            userLookup,
            sendEmailVerifShared,
            emailVerificationService
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
        writer.setPendingEmail.mockResolvedValue(undefined);
        sendEmailVerifShared.sendIt.mockResolvedValue(undefined);

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

        expect(writer.setPendingEmail).toHaveBeenCalledWith(user.id, "new@example.com");

        expect(emailVerificationService.deleteByUserIdAndType).toHaveBeenCalledWith(user.id, "change");

        expect(sendEmailVerifShared.sendIt).toHaveBeenCalledWith(
            "new@example.com",
            user,
            "/public/confirm-email-change",
            "change"
        );

        expect(mapper.mapToDto).toHaveBeenCalledWith(user);

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

        expect(writer.setPendingEmail).not.toHaveBeenCalled();
    });
});