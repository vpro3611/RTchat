
import { ConfirmResetPasswordUseCase } from "../../../src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/confirm_reset_password_use_case";
import { EmailVerificationInterface } from "../../../src/modules/infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";
import { UserRepoWriter } from "../../../src/modules/users/ports/user_repo_interfaces";
import { InvalidTokenError } from "../../../src/modules/infrasctructure/ports/email_verif_infra/errors/token_errors";
import crypto from "node:crypto";

describe('ConfirmResetPasswordUseCase', () => {
    let useCase: ConfirmResetPasswordUseCase;
    let emailVerificationService: jest.Mocked<EmailVerificationInterface>;
    let userRepoWriter: jest.Mocked<UserRepoWriter>;

    beforeEach(() => {
        emailVerificationService = {
            saveToken: jest.fn(),
            findByTokenHash: jest.fn(),
            deleteByUserId: jest.fn(),
            deleteByTokenHash: jest.fn(),
            deleteByUserIdAndType: jest.fn(),
        };

        userRepoWriter = {
            save: jest.fn(),
            markAsVerified: jest.fn(),
            setPendingEmail: jest.fn(),
            confirmPendingEmail: jest.fn(),
            updateAvatarId: jest.fn(),
            setPendingPassword: jest.fn(),
            confirmPendingPassword: jest.fn(),
        } as any;

        useCase = new ConfirmResetPasswordUseCase(emailVerificationService, userRepoWriter);
    });

    it('should successfully confirm password reset', async () => {
        const rawToken = 'valid-token';
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        
        emailVerificationService.findByTokenHash.mockResolvedValue({
            userId: 'user-id',
            tokenType: 'reset-pass'
        });

        await useCase.execute(rawToken);

        expect(emailVerificationService.findByTokenHash).toHaveBeenCalledWith(tokenHash);
        expect(userRepoWriter.confirmPendingPassword).toHaveBeenCalledWith('user-id');
        expect(emailVerificationService.deleteByTokenHash).toHaveBeenCalledWith(tokenHash);
    });

    it('should throw InvalidTokenError if token is not found', async () => {
        emailVerificationService.findByTokenHash.mockResolvedValue(null);

        await expect(useCase.execute('invalid-token'))
            .rejects.toThrow(InvalidTokenError);
    });

    it('should throw InvalidTokenError if token type is not reset-pass', async () => {
        emailVerificationService.findByTokenHash.mockResolvedValue({
            userId: 'user-id',
            tokenType: 'register'
        });

        await expect(useCase.execute('some-token'))
            .rejects.toThrow('Invalid token type');
    });
});
