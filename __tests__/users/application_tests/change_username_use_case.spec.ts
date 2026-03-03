import { ChangeUsernameUseCase } from "../../../src/modules/users/application/change_username_use_case";
import { UsernameAlreadyExistsError } from "../../../src/modules/users/errors/username_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangeUsernameUseCase", () => {
    let reader: any;
    let writer: any;
    let useCase: ChangeUsernameUseCase;
    let user: User;

    beforeEach(() => {
        reader = {
            getUserById: jest.fn(),
            getUserByUsername: jest.fn(),
        };

        writer = {
            save: jest.fn(),
        };

        useCase = new ChangeUsernameUseCase(reader, writer);

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "oldusername",
            "test@example.com",
            "hash",
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should change username successfully", async () => {
        reader.getUserById.mockResolvedValue(user);
        reader.getUserByUsername.mockResolvedValue(null);
        writer.save.mockResolvedValue(user);

        const result = await useCase.changeUsernameUseCase(
            user.id,
            "newusername"
        );

        expect(reader.getUserByUsername).toHaveBeenCalledWith("newusername");
        expect(writer.save).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it("should throw if username already exists", async () => {
        reader.getUserById.mockResolvedValue(user);
        reader.getUserByUsername.mockResolvedValue(user);

        await expect(
            useCase.changeUsernameUseCase(user.id, "existingusername")
        ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            "oldusername",
            "test@example.com",
            "hash",
            false,
            new Date(),
            new Date(),
            new Date()
        );

        reader.getUserById.mockResolvedValue(inactiveUser);
        reader.getUserByUsername.mockResolvedValue(null);

        await expect(
            useCase.changeUsernameUseCase(user.id, "newusername")
        ).rejects.toThrow();
    });

    it("should throw if username is invalid (too short)", async () => {
        await expect(
            useCase.changeUsernameUseCase(user.id, "ab")
        ).rejects.toThrow();
    });
});