"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_full_black_list_use_case_1 = require("../../../src/modules/users/application/get_full_black_list_use_case");
const user_1 = require("../../../src/modules/users/domain/user");
describe("GetFullBlackListUseCase", () => {
    let userToUserBlocksInterface;
    let userLookup;
    let userMapper;
    let useCase;
    const actorId = "11111111-1111-1111-1111-111111111111";
    const blockedUser1Id = "22222222-2222-2222-2222-222222222222";
    const blockedUser2Id = "33333333-3333-3333-3333-333333333333";
    beforeEach(() => {
        userToUserBlocksInterface = {
            getFullBlacklist: jest.fn(),
        };
        userLookup = {
            getUserOrThrow: jest.fn(),
        };
        userMapper = {
            mapToDto: jest.fn(),
        };
        useCase = new get_full_black_list_use_case_1.GetFullBlackListUseCase(userToUserBlocksInterface, userLookup, userMapper);
    });
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should return empty blacklist when no users blocked", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userLookup.getUserOrThrow.mockResolvedValue(mockUser);
        userToUserBlocksInterface.getFullBlacklist.mockResolvedValue([]);
        const result = await useCase.getFullBlackListUseCase(actorId);
        expect(userLookup.getUserOrThrow).toHaveBeenCalledWith(actorId);
        expect(userToUserBlocksInterface.getFullBlacklist).toHaveBeenCalledWith(actorId);
        expect(result).toEqual([]);
    });
    it("should return blocked users", async () => {
        const mockUser = createMockUser(actorId, true, true);
        const blockedUser1 = createMockUser(blockedUser1Id, true, true);
        const blockedUser2 = createMockUser(blockedUser2Id, true, true);
        userLookup.getUserOrThrow.mockResolvedValue(mockUser);
        userToUserBlocksInterface.getFullBlacklist.mockResolvedValue([blockedUser1, blockedUser2]);
        userMapper.mapToDto
            .mockReturnValue({ id: blockedUser1Id, username: "blocked1" })
            .mockReturnValue({ id: blockedUser2Id, username: "blocked2" });
        const result = await useCase.getFullBlackListUseCase(actorId);
        expect(result.length).toBe(2);
        expect(userMapper.mapToDto).toHaveBeenCalledTimes(2);
    });
    // -------------------------
    // USER NOT FOUND
    // -------------------------
    it("should throw when user not found", async () => {
        userLookup.getUserOrThrow.mockRejectedValue(new Error("User not found"));
        await expect(useCase.getFullBlackListUseCase(actorId)).rejects.toThrow("User not found");
        expect(userToUserBlocksInterface.getFullBlacklist).not.toHaveBeenCalled();
    });
    // -------------------------
    // USER NOT VERIFIED OR NOT ACTIVE
    // -------------------------
    it("should throw when user is not verified", async () => {
        const mockUser = createMockUser(actorId, false, true);
        userLookup.getUserOrThrow.mockResolvedValue(mockUser);
        await expect(useCase.getFullBlackListUseCase(actorId)).rejects.toThrow("not active or not verified");
        expect(userToUserBlocksInterface.getFullBlacklist).not.toHaveBeenCalled();
    });
    it("should throw when user is not active", async () => {
        const mockUser = createMockUser(actorId, true, false);
        userLookup.getUserOrThrow.mockResolvedValue(mockUser);
        await expect(useCase.getFullBlackListUseCase(actorId)).rejects.toThrow("not active or not verified");
        expect(userToUserBlocksInterface.getFullBlacklist).not.toHaveBeenCalled();
    });
    // -------------------------
    // EDGE CASES
    // -------------------------
    it("should propagate repository error", async () => {
        const mockUser = createMockUser(actorId, true, true);
        userLookup.getUserOrThrow.mockResolvedValue(mockUser);
        userToUserBlocksInterface.getFullBlacklist.mockRejectedValue(new Error("DB error"));
        await expect(useCase.getFullBlackListUseCase(actorId)).rejects.toThrow("DB error");
    });
    it("should handle large blacklist", async () => {
        const mockUser = createMockUser(actorId, true, true);
        const blockedUsers = Array.from({ length: 100 }, (_, i) => createMockUser(`22222222-2222-2222-2222-${i.toString().padStart(12, '0')}`, true, true));
        userLookup.getUserOrThrow.mockResolvedValue(mockUser);
        userToUserBlocksInterface.getFullBlacklist.mockResolvedValue(blockedUsers);
        userMapper.mapToDto.mockImplementation((user) => ({ id: user.id }));
        const result = await useCase.getFullBlackListUseCase(actorId);
        expect(result.length).toBe(100);
        expect(userMapper.mapToDto).toHaveBeenCalledTimes(100);
    });
});
function createMockUser(id, isVerified, isActive) {
    return user_1.User.restore(id, "testuser", "test@example.com", "hash123", isActive, isVerified, new Date(), new Date(), new Date());
}
