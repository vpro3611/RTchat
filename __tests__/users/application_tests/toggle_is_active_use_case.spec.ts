
import { ToggleIsActiveUseCase } from "../../../src/modules/users/application/toggle_status_use_case";
import { User } from "../../../src/modules/users/domain/user";

describe("ToggleIsActiveUseCase", () => {
    let reader: any;
    let writer: any;
    let useCase: ToggleIsActiveUseCase;

    beforeEach(() => {
        reader = {
            getUserById: jest.fn(),
        };

        writer = {
            save: jest.fn(),
        };

        useCase = new ToggleIsActiveUseCase(reader, writer);
    });

    function createUser(isActive: boolean) {
        return User.restore(
            "11111111-1111-1111-1111-111111111111",
            "username",
            "test@example.com",
            "hash",
            isActive,
            new Date(),
            new Date(),
            new Date()
        );
    }

    it("should toggle active from true to false", async () => {
        const user = createUser(true);

        reader.getUserById.mockResolvedValue(user);
        writer.save.mockResolvedValue(user);

        await useCase.toggleIsActiveUseCase(user.id);

        expect(writer.save).toHaveBeenCalled();
        expect(user.getIsActive()).toBe(false);
    });

    it("should toggle active from false to true", async () => {
        const user = createUser(false);

        reader.getUserById.mockResolvedValue(user);
        writer.save.mockResolvedValue(user);

        await useCase.toggleIsActiveUseCase(user.id);

        expect(writer.save).toHaveBeenCalled();
        expect(user.getIsActive()).toBe(true);
    });
});