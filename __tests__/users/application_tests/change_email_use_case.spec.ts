import { ChangeEmailUseCase } from "../../../src/modules/users/application/change_email_use_case";
import { EmailAlreadyExistsError } from "../../../src/modules/users/errors/email_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangeEmailUseCase", () => {
    let reader: any;
    let writer: any;
    let useCase: ChangeEmailUseCase;
    let user: User;

    beforeEach(() => {
        reader = {
            getUserById: jest.fn(),
            getUserByEmail: jest.fn(),
        };

        writer = {
            save: jest.fn(),
        };

        useCase = new ChangeEmailUseCase(reader, writer);

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "testuser",
            "old@example.com",
            "hash",
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should change email successfully", async () => {
        reader.getUserById.mockResolvedValue(user);
        reader.getUserByEmail.mockResolvedValue(null);
        writer.save.mockResolvedValue(user);

        const result = await useCase.changeEmailUseCase(
            user.id,
            "new@example.com"
        );

        expect(writer.save).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it("should throw if email already exists", async () => {
        reader.getUserById.mockResolvedValue(user);
        reader.getUserByEmail.mockResolvedValue(user);

        await expect(
            useCase.changeEmailUseCase(user.id, "existing@example.com")
        ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
    });
});