import { UpdateLastSeenAtUseCase } from "../../../src/modules/users/application/update_last_seen_at_use_case";

describe("UpdateLastSeenAtUseCase", () => {
    it("should update last seen at for a user", async () => {
        const repo = { updateLastSeenAt: jest.fn() };
        const useCase = new UpdateLastSeenAtUseCase(repo as any);
        const date = new Date();
        await useCase.execute("user-id", date);
        expect(repo.updateLastSeenAt).toHaveBeenCalledWith("user-id", date);
    });
});
