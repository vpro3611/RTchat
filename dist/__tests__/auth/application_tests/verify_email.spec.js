"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_verification_use_case_1 = require("../../../src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case");
const auth_service_1 = require("../../../src/modules/authentification/auth_service");
jest.mock("../../../src/modules/infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg");
jest.mock("../../../src/modules/users/repositories/user_repo_writer_pg");
jest.mock("../../../src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case");
describe("AuthService - verifyEmail", () => {
    let txManager;
    let service;
    beforeEach(() => {
        txManager = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };
        service = new auth_service_1.AuthService({}, {}, txManager);
    });
    it("should verify email successfully", async () => {
        const executeMock = jest.fn().mockResolvedValue(undefined);
        email_verification_use_case_1.EmailVerificationUseCase.mockImplementation(() => ({
            execute: executeMock,
        }));
        await service.verifyEmail("verification-token");
        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(executeMock).toHaveBeenCalledWith("verification-token");
    });
    it("should propagate verification error", async () => {
        const executeMock = jest.fn().mockRejectedValue(new Error("invalid token"));
        email_verification_use_case_1.EmailVerificationUseCase.mockImplementation(() => ({
            execute: executeMock,
        }));
        await expect(service.verifyEmail("bad-token")).rejects.toThrow("invalid token");
    });
});
