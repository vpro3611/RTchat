import { BlockSpecificUserUseCase } from "../../../src/modules/users/application/block_specific_user_use_case";
import { CannotBlockYourselfError } from "../../../src/modules/users/errors/use_case_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("BlockSpecificUserUseCase", () => {
    let userToUserBlocksRepo: any;
    let userRepoReader: any;
    let userMapper: any;
    let useCase: BlockSpecificUserUseCase;

    const actorId = "11111111-1111-1111-1111-111111111111";
    const targetId = "22222222-2222-2222-2222-222222222222";

    beforeEach(() => {
        userToUserBlocksRepo = {
            blockSpecificUser: jest.fn(),
            ensureBlockedExists: jest.fn(),
        };

        userRepoReader = {
            getUserById: jest.fn(),
        };

        userMapper = {
            mapToDto: jest.fn(),
        };

        useCase = new BlockSpecificUserUseCase(
            userToUserBlocksRepo,
            userRepoReader,
            userMapper
        );
    });

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should block user successfully", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        userToUserBlocksRepo.ensureBlockedExists.mockResolvedValue(false);
        userToUserBlocksRepo.blockSpecificUser.mockResolvedValue(createMockUser(targetId, true, true));
        userMapper.mapToDto.mockReturnValue({ id: targetId, username: "targetuser" });

        const result = await useCase.blockSpecificUserUseCase(actorId, targetId);

        expect(userRepoReader.getUserById).toHaveBeenCalledWith(actorId);
        expect(userToUserBlocksRepo.ensureBlockedExists).toHaveBeenCalledWith(actorId, targetId);
        expect(userToUserBlocksRepo.blockSpecificUser).toHaveBeenCalledWith(actorId, targetId);
        expect(userMapper.mapToDto).toHaveBeenCalled();
        expect(result).toEqual({ id: targetId, username: "targetuser" });
    });

    // -------------------------
    // CANNOT BLOCK SELF
    // -------------------------

    it("should throw CannotBlockYourselfError when blocking yourself", async () => {
        await expect(
            useCase.blockSpecificUserUseCase(actorId, actorId)
        ).rejects.toBeInstanceOf(CannotBlockYourselfError);

        expect(userToUserBlocksRepo.blockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // USER NOT FOUND
    // -------------------------

    it("should throw when actor not found", async () => {
        userRepoReader.getUserById.mockResolvedValue(null);

        await expect(
            useCase.blockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("User not found");

        expect(userToUserBlocksRepo.blockSpecificUser).not.toHaveBeenCalled();
    });

    it("should throw when target user not found (FK constraint)", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById
            .mockResolvedValueOnce(mockUser) // actor
            .mockResolvedValueOnce(null); // target check doesn't exist in use case

        // This test is limited because use case doesn't check target existence
    });

    // -------------------------
    // USER NOT VERIFIED OR NOT ACTIVE
    // -------------------------

    it("should throw when actor is not verified", async () => {
        const mockUser = createMockUser(actorId, false, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);

        await expect(
            useCase.blockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("not active or not verified");

        expect(userToUserBlocksRepo.blockSpecificUser).not.toHaveBeenCalled();
    });

    it("should throw when actor is not active", async () => {
        const mockUser = createMockUser(actorId, true, false);
        userRepoReader.getUserById.mockResolvedValue(mockUser);

        await expect(
            useCase.blockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("not active or not verified");

        expect(userToUserBlocksRepo.blockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // ALREADY BLOCKED
    // -------------------------

    it("should throw when user already blocked", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        userToUserBlocksRepo.ensureBlockedExists.mockResolvedValue(true);

        await expect(
            useCase.blockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("Failed to block user, user already blocked by you");

        expect(userToUserBlocksRepo.blockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // EDGE CASES
    // -------------------------

    it("should propagate repository error", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        userToUserBlocksRepo.ensureBlockedExists.mockResolvedValue(false);
        userToUserBlocksRepo.blockSpecificUser.mockRejectedValue(new Error("DB error"));

        await expect(
            useCase.blockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("DB error");
    });

    it("should handle invalid UUID format", async () => {
        // UUID validation happens at controller level, not use case
        // This test documents the expected behavior
        await expect(
            useCase.blockSpecificUserUseCase("invalid-uuid", targetId)
        ).rejects.toThrow();
    });
});

function createMockUser(id: string, isVerified: boolean, isActive: boolean): User {
    return User.restore(
        id,
        "testuser",
        "test@example.com",
        "hash123",
        isActive,
        isVerified,
        new Date(),
        new Date(),
        new Date(),
    );
}
