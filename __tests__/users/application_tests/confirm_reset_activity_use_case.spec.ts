
import { ConfirmResetActivityUseCase } from "../../../src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/confirm_reset_activity_use_case";
import crypto from "node:crypto";

describe("ConfirmResetActivityUseCase", () => {
    let verificationService: any;
    let writer: any;
    let useCase: ConfirmResetActivityUseCase;

    beforeEach(() => {
        verificationService = {
            findByTokenHash: jest.fn(),
            deleteByTokenHash: jest.fn(),
        };
        writer = {
            confirmPendingIsActive: jest.fn(),
        };

        useCase = new ConfirmResetActivityUseCase(verificationService, writer);
    });

    it("should confirm reactivation successfully", async () => {
        const rawToken = "valid-token";
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        verificationService.findByTokenHash.mockResolvedValue({
            userId: "user-id",
            tokenType: "reset-activity"
        });

        await useCase.execute(rawToken);

        expect(verificationService.findByTokenHash).toHaveBeenCalledWith(tokenHash);
        expect(writer.confirmPendingIsActive).toHaveBeenCalledWith("user-id");
        expect(verificationService.deleteByTokenHash).toHaveBeenCalledWith(tokenHash);
    });

    it("should throw if token is not reset-activity type", async () => {
        const rawToken = "wrong-type-token";
        
        verificationService.findByTokenHash.mockResolvedValue({
            userId: "user-id",
            tokenType: "register"
        });

        await expect(useCase.execute(rawToken)).rejects.toThrow("Invalid token type");
    });

    it("should throw if token not found", async () => {
        verificationService.findByTokenHash.mockResolvedValue(null);

        await expect(useCase.execute("non-existent")).rejects.toThrow();
    });
});
