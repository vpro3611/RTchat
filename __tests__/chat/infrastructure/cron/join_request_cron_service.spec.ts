import { JoinRequestCronService } from "../../../../src/modules/chat/infrastructure/cron/join_request_cron_service";
import { ExpireJoinRequestsUseCase } from "../../../../src/modules/chat/application/conversation_requests/expire_join_requests_use_case";
import cron from "node-cron";

jest.mock("node-cron", () => ({
    schedule: jest.fn()
}));

describe("JoinRequestCronService", () => {
    let cronService: JoinRequestCronService;
    let mockExpireUseCase: jest.Mocked<ExpireJoinRequestsUseCase>;

    beforeEach(() => {
        mockExpireUseCase = {
            execute: jest.fn().mockResolvedValue(0)
        } as any;
        cronService = new JoinRequestCronService(mockExpireUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should start the cron job and run immediately", async () => {
        await cronService.start();

        expect(mockExpireUseCase.execute).toHaveBeenCalled();
        expect(cron.schedule).toHaveBeenCalledWith("*/5 * * * *", expect.any(Function));
    });

    it("should log the number of expired requests", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation();
        mockExpireUseCase.execute.mockResolvedValueOnce(5);

        await cronService.start();

        expect(logSpy).toHaveBeenCalledWith("[Cron] Expired 5 join requests.");
        logSpy.mockRestore();
    });

    it("should log error if execution fails", async () => {
        const errorSpy = jest.spyOn(console, "error").mockImplementation();
        mockExpireUseCase.execute.mockRejectedValueOnce(new Error("Database error"));

        await cronService.start();

        expect(errorSpy).toHaveBeenCalledWith("[Cron] Error expiring join requests:", expect.any(Error));
        errorSpy.mockRestore();
    });
});
