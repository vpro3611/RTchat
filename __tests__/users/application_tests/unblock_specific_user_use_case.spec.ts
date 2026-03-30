import { UnblockSpecificUserUseCase } from "../../../src/modules/users/application/unblock_specific_user_use_case";
import { CannotBlockYourselfError, UnblockUserError } from "../../../src/modules/users/errors/use_case_errors";
import { User } from "../../../src/modules/users/domain/user";

describe("UnblockSpecificUserUseCase", () => {
    let userToUserBlocksRepo: any;
    let userRepoReader: any;
    let userMapper: any;
    let useCase: UnblockSpecificUserUseCase;

    const actorId = "11111111-1111-1111-1111-111111111111";
    const targetId = "22222222-2222-2222-2222-222222222222";

    beforeEach(() => {
        userToUserBlocksRepo = {
            unblockSpecificUser: jest.fn(),
            ensureBlockedExists: jest.fn(),
        };

        userRepoReader = {
            getUserById: jest.fn(),
        };

        userMapper = {
            mapToDto: jest.fn(),
        };

        useCase = new UnblockSpecificUserUseCase(
            userToUserBlocksRepo,
            userRepoReader,
            userMapper
        );
    });

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should unblock user successfully", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        userToUserBlocksRepo.ensureBlockedExists.mockResolvedValue(true);
        userToUserBlocksRepo.unblockSpecificUser.mockResolvedValue(createMockUser(targetId, true, true));
        userMapper.mapToDto.mockReturnValue({ id: targetId, username: "targetuser" });

        const result = await useCase.unblockSpecificUserUseCase(actorId, targetId);

        expect(userRepoReader.getUserById).toHaveBeenCalledWith(actorId);
        expect(userToUserBlocksRepo.ensureBlockedExists).toHaveBeenCalledWith(actorId, targetId);
        expect(userToUserBlocksRepo.unblockSpecificUser).toHaveBeenCalledWith(actorId, targetId);
        expect(userMapper.mapToDto).toHaveBeenCalled();
        expect(result).toEqual({ id: targetId, username: "targetuser" });
    });

    // -------------------------
    // CANNOT UNBLOCK SELF
    // -------------------------

    it("should throw CannotBlockYourselfError when unblocking yourself", async () => {
        await expect(
            useCase.unblockSpecificUserUseCase(actorId, actorId)
        ).rejects.toBeInstanceOf(CannotBlockYourselfError);

        expect(userToUserBlocksRepo.unblockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // USER NOT FOUND
    // -------------------------

    it("should throw when actor not found", async () => {
        userRepoReader.getUserById.mockResolvedValue(null);

        await expect(
            useCase.unblockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("User not found");

        expect(userToUserBlocksRepo.unblockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // USER NOT VERIFIED OR NOT ACTIVE
    // -------------------------

    it("should throw when actor is not verified", async () => {
        const mockUser = createMockUser(actorId, false, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);

        await expect(
            useCase.unblockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("not active or not verified");

        expect(userToUserBlocksRepo.unblockSpecificUser).not.toHaveBeenCalled();
    });

    it("should throw when actor is not active", async () => {
        const mockUser = createMockUser(actorId, true, false);
        userRepoReader.getUserById.mockResolvedValue(mockUser);

        await expect(
            useCase.unblockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("not active or not verified");

        expect(userToUserBlocksRepo.unblockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // USER NOT BLOCKED
    // -------------------------

    it("should throw when user is not blocked", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        userToUserBlocksRepo.ensureBlockedExists.mockResolvedValue(false);

        await expect(
            useCase.unblockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("Failed to unblock user, user not blocked by you");

        expect(userToUserBlocksRepo.unblockSpecificUser).not.toHaveBeenCalled();
    });

    // -------------------------
    // EDGE CASES
    // -------------------------

    it("should propagate repository error", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userRepoReader.getUserById.mockResolvedValue(mockUser);
        userToUserBlocksRepo.ensureBlockedExists.mockResolvedValue(true);
        userToUserBlocksRepo.unblockSpecificUser.mockRejectedValue(new Error("DB error"));

        await expect(
            useCase.unblockSpecificUserUseCase(actorId, targetId)
        ).rejects.toThrow("DB error");
    });

    it("should handle invalid UUID format", async () => {
        await expect(
            useCase.unblockSpecificUserUseCase("invalid-uuid", targetId)
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
