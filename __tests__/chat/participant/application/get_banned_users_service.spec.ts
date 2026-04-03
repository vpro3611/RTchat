import { GetBannedUsersService } from "../../../../src/modules/chat/transactional_services/participant/get_banned_users_service";

describe("GetBannedUsersService (transaction)", () => {

    let txManager: any;
    let service: GetBannedUsersService;

    const ACTOR_ID = "11111111-1111-1111-1111-111111111111";
    const CONVERSATION_ID = "33333333-3333-3333-3333-333333333333";

    beforeEach(() => {
        const encryptionService = {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
            decryptBuffer: jest.fn(),
            encryptToBuffer: jest.fn(),
            decryptFromBuffer: jest.fn()
        };
        txManager = {
            runInTransaction: jest.fn(async (callback) => {
                const mockClient = {
                    query: jest.fn().mockResolvedValue({ rows: [] }),
                    release: jest.fn()
                };
                try {
                    return await callback(mockClient);
                } catch (error) {
                    throw error;
                }
            })
        };

        service = new GetBannedUsersService(txManager, encryptionService as any);
    });

    // =========================
    // Transaction execution
    // =========================

    it("should call runInTransaction when getting banned users", async () => {
        await expect(
            service.getBannedUsersService(
                ACTOR_ID,
                CONVERSATION_ID
            )
        ).rejects.toThrow();

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
        expect(txManager.runInTransaction).toHaveBeenCalledWith(expect.any(Function));
    });

    // =========================
    // Error handling
    // =========================

    it("should propagate transaction errors", async () => {
        txManager.runInTransaction = jest.fn(async () => {
            throw new Error("Transaction failed");
        });

        await expect(
            service.getBannedUsersService(
                ACTOR_ID,
                CONVERSATION_ID
            )
        ).rejects.toThrow("Transaction failed");
    });

});
