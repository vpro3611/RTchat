import { EmailVerificationUseCase } from "../../../src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case";
import {AuthService} from "../../../src/modules/authentification/auth_service";

jest.mock("../../../src/modules/infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg");
jest.mock("../../../src/modules/users/repositories/user_repo_writer_pg");
jest.mock("../../../src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case");

describe("AuthService - verifyEmail", () => {
    let txManager: any;
    let service: AuthService;

    beforeEach(() => {
        txManager = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };

        service = new AuthService({} as any, {} as any, txManager);
    });

    it("should verify email successfully", async () => {
        const executeMock = jest.fn().mockResolvedValue(undefined);

        (EmailVerificationUseCase as jest.Mock).mockImplementation(() => ({
            execute: executeMock,
        }));

        await service.verifyEmail("verification-token");

        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(executeMock).toHaveBeenCalledWith("verification-token");
    });

    it("should propagate verification error", async () => {
        const executeMock = jest.fn().mockRejectedValue(new Error("invalid token"));

        (EmailVerificationUseCase as jest.Mock).mockImplementation(() => ({
            execute: executeMock,
        }));

        await expect(
            service.verifyEmail("bad-token")
        ).rejects.toThrow("invalid token");
    });
});