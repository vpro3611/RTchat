import { ChangeUsernameUseCase } from "../../../src/modules/users/application/change_username_use_case";
import { UsernameAlreadyExistsError } from "../../../src/modules/users/errors/username_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("ChangeUsernameUseCase", () => {
    let reader: any;
    let writer: any;
    let mapper: any;
    let userLookup: any;
    let useCase: ChangeUsernameUseCase;
    let user: User;

    beforeEach(() => {
        reader = {
            getUserByUsername: jest.fn(),
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

        useCase = new ChangeUsernameUseCase(
            reader,
            writer,
            mapper,
            userLookup
        );

        user = User.restore(
            "11111111-1111-1111-1111-111111111111",
            "oldusername",
            "test@example.com",
            "hash",
            true,
            true,
            new Date(),
            new Date(),
            new Date()
        );
    });

    it("should change username successfully", async () => {
        userLookup.getUserOrThrow.mockResolvedValue(user);
        reader.getUserByUsername.mockResolvedValue(null);
        writer.save.mockResolvedValue(user);
        mapper.mapToDto.mockReturnValue({
            id: user.id,
            username: "newusername",
        });

        const result = await useCase.changeUsernameUseCase(
            user.id,
            "newusername"
        );

        expect(reader.getUserByUsername)
            .toHaveBeenCalledWith("newusername");

        expect(writer.save).toHaveBeenCalledWith(user);

        expect(mapper.mapToDto).toHaveBeenCalledWith(user);

        expect(user.getUsername().getValue())
            .toBe("newusername");

        expect(result).toEqual({
            id: user.id,
            username: "newusername",
        });
    });

    it("should throw if username already exists", async () => {
        userLookup.getUserOrThrow.mockResolvedValue(user);
        reader.getUserByUsername.mockResolvedValue({});

        await expect(
            useCase.changeUsernameUseCase(user.id, "existingusername")
        ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);

        expect(writer.save).not.toHaveBeenCalled();
        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });

    it("should throw if user is inactive", async () => {
        const inactiveUser = User.restore(
            user.id,
            "oldusername",
            "test@example.com",
            "hash",
            false,
            true,
            new Date(),
            new Date(),
            new Date()
        );

        userLookup.getUserOrThrow.mockResolvedValue(inactiveUser);
        reader.getUserByUsername.mockResolvedValue(null);

        await expect(
            useCase.changeUsernameUseCase(user.id, "newusername")
        ).rejects.toThrow();

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if user is not verified", async () => {
        const notVerifiedUser = User.restore(
            user.id,
            "oldusername",
            "test@example.com",
            "hash",
            true,
            false,
            new Date(),
            new Date(),
            new Date()
        );

        userLookup.getUserOrThrow.mockResolvedValue(notVerifiedUser);
        reader.getUserByUsername.mockResolvedValue(null);

        await expect(
            useCase.changeUsernameUseCase(user.id, "newusername")
        ).rejects.toThrow();

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should throw if username is invalid", async () => {
        await expect(
            useCase.changeUsernameUseCase(user.id, "ab")
        ).rejects.toThrow();

        expect(userLookup.getUserOrThrow).not.toHaveBeenCalled();
    });

    it("should propagate lookup error", async () => {
        userLookup.getUserOrThrow.mockRejectedValue(
            new Error("USER_NOT_FOUND")
        );

        await expect(
            useCase.changeUsernameUseCase(user.id, "newusername")
        ).rejects.toThrow("USER_NOT_FOUND");

        expect(writer.save).not.toHaveBeenCalled();
    });
});