import { UnbanGroupParticipantService } from "../../../../src/modules/chat/transactional_services/participant/unban_group_participant_service";

describe("UnbanGroupParticipantService (transaction)", () => {

    let txManager: any;
    let service: UnbanGroupParticipantService;

    const ACTOR_ID = "11111111-1111-1111-1111-111111111111";
    const TARGET_ID = "22222222-2222-2222-2222-222222222222";
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

        service = new UnbanGroupParticipantService(txManager, encryptionService as any);
    });

    // =========================
    // Transaction execution
    // =========================

    it("should call runInTransaction when unbanning participant", async () => {
        await expect(
            service.unbanGroupParticipantService(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
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
            service.unbanGroupParticipantService(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toThrow("Transaction failed");
    });

});
