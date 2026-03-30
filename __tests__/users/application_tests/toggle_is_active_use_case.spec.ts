import { ToggleIsActiveUseCase } from "../../../src/modules/users/application/toggle_status_use_case_to_false";
import { User } from "../../../src/modules/users/domain/user";

describe("ToggleIsActiveUseCase", () => {
    let writer: any;
    let mapper: any;
    let lookup: any;
    let useCase: ToggleIsActiveUseCase;

    beforeEach(() => {
        writer = {
            save: jest.fn(),
        };

        mapper = {
            mapToDto: jest.fn(),
        };

        lookup = {
            getUserOrThrow: jest.fn(),
        };

        useCase = new ToggleIsActiveUseCase(
            writer,
            mapper,
            lookup
        );
    });

    function createUser(isActive: boolean, isVerified = true) {
        return User.restore(
            "11111111-1111-1111-1111-111111111111",
            "username",
            "test@example.com",
            "hash",
            isActive,
            isVerified,
            new Date(),
            new Date(),
            new Date()
        );
    }

    it("should toggle active from true to false", async () => {
        const user = createUser(true, true);

        lookup.getUserOrThrow.mockResolvedValue(user);
        writer.save.mockResolvedValue(user);
        mapper.mapToDto.mockReturnValue({
            id: user.id,
            is_active: false,
        });

        const result = await useCase.toggleIsActiveUseCase(user.id);

        expect(user.getIsActive()).toBe(false);
        expect(writer.save).toHaveBeenCalledWith(user);
        expect(mapper.mapToDto).toHaveBeenCalledWith(user);
        expect(result).toEqual({
            id: user.id,
            is_active: false,
        });
    });

    it("should throw if user is already inactive", async () => {
        const user = createUser(false, true);

        lookup.getUserOrThrow.mockResolvedValue(user);

        await expect(
            useCase.toggleIsActiveUseCase(user.id)
        ).rejects.toThrow();

        expect(writer.save).not.toHaveBeenCalled();
        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });

    it("should throw if user is not verified", async () => {
        const user = createUser(true, false);

        lookup.getUserOrThrow.mockResolvedValue(user);

        await expect(
            useCase.toggleIsActiveUseCase(user.id)
        ).rejects.toThrow();

        expect(writer.save).not.toHaveBeenCalled();
        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });

    it("should propagate error if lookup fails", async () => {
        lookup.getUserOrThrow.mockRejectedValue(
            new Error("USER_NOT_FOUND")
        );

        await expect(
            useCase.toggleIsActiveUseCase("invalid-id")
        ).rejects.toThrow("USER_NOT_FOUND");

        expect(writer.save).not.toHaveBeenCalled();
    });

    it("should propagate error if save fails", async () => {
        const user = createUser(true, true);

        lookup.getUserOrThrow.mockResolvedValue(user);
        writer.save.mockRejectedValue(
            new Error("DATABASE_ERROR")
        );

        await expect(
            useCase.toggleIsActiveUseCase(user.id)
        ).rejects.toThrow("DATABASE_ERROR");

        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });
});