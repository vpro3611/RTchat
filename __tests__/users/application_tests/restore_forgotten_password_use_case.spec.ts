
import { RestoreForgottenPasswordUseCase } from "../../../src/modules/users/application/restore_forgotten_password_use_case";
import { UserRepoReader, UserRepoWriter } from "../../../src/modules/users/ports/user_repo_interfaces";
import { SendVerifEmailShared } from "../../../src/modules/users/shared/send_verif_email_shared";
import { UserMapper } from "../../../src/modules/users/shared/map_to_dto";
import { BcryptInterface } from "../../../src/modules/infrasctructure/ports/bcrypter/bcrypt_interface";
import { EmailVerificationInterface } from "../../../src/modules/infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";
import { User } from "../../../src/modules/users/domain/user";
import { UserNotFoundError } from "../../../src/modules/users/errors/use_case_errors";
import { InvalidPasswordError } from "../../../src/modules/users/errors/password_errors";

describe('RestoreForgottenPasswordUseCase', () => {
    let useCase: RestoreForgottenPasswordUseCase;
    let userRepoWriter: jest.Mocked<UserRepoWriter>;
    let userRepoReader: jest.Mocked<UserRepoReader>;
    let sendEmailVerifShared: jest.Mocked<SendVerifEmailShared>;
    let userMapper: UserMapper;
    let bcrypter: jest.Mocked<BcryptInterface>;
    let emailVerificationService: jest.Mocked<EmailVerificationInterface>;

    const mockUser = User.restore(
        'user-id',
        'testuser',
        'test@example.com',
        'hashed-password',
        true,
        true,
        new Date(),
        new Date(),
        new Date(),
        null
    );

    beforeEach(() => {
        userRepoWriter = {
            save: jest.fn(),
            markAsVerified: jest.fn(),
            setPendingEmail: jest.fn(),
            confirmPendingEmail: jest.fn(),
            updateAvatarId: jest.fn(),
            setPendingPassword: jest.fn(),
            confirmPendingPassword: jest.fn(),
        } as any;

        userRepoReader = {
            getUserById: jest.fn(),
            getPendingEmailByUserId: jest.fn(),
            getUserByUsername: jest.fn(),
            getUserByEmail: jest.fn(),
            searchUsers: jest.fn(),
            getPendingPasswordByUserId: jest.fn(),
        } as any;

        sendEmailVerifShared = {
            sendIt: jest.fn(),
        } as any;

        userMapper = new UserMapper();

        bcrypter = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        emailVerificationService = {
            saveToken: jest.fn(),
            findByTokenHash: jest.fn(),
            deleteByUserId: jest.fn(),
            deleteByTokenHash: jest.fn(),
            deleteByUserIdAndType: jest.fn(),
        };

        useCase = new RestoreForgottenPasswordUseCase(
            userRepoWriter,
            userRepoReader,
            sendEmailVerifShared,
            userMapper,
            bcrypter,
            emailVerificationService
        );
    });

    it('should successfully initiate password restoration', async () => {
        userRepoReader.getUserByEmail.mockResolvedValue(mockUser);
        bcrypter.compare.mockResolvedValue(false);
        bcrypter.hash.mockResolvedValue('new-hashed-password');

        const result = await useCase.restoreForgottenPasswordUseCase('test@example.com', 'NewPass123!long');

        expect(userRepoReader.getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(emailVerificationService.deleteByUserIdAndType).toHaveBeenCalledWith(mockUser.id, 'reset-pass');
        expect(userRepoWriter.setPendingPassword).toHaveBeenCalledWith(mockUser.id, 'new-hashed-password');
        expect(sendEmailVerifShared.sendIt).toHaveBeenCalledWith(
            'test@example.com',
            mockUser,
            '/public/confirm-reset-password',
            'reset-pass'
        );
        expect(result.id).toBe(mockUser.id);
    });

    it('should throw UserNotFoundError if email does not exist', async () => {
        userRepoReader.getUserByEmail.mockResolvedValue(null);

        await expect(useCase.restoreForgottenPasswordUseCase('nonexistent@example.com', 'NewPass123!long'))
            .rejects.toThrow(UserNotFoundError);
    });

    it('should throw InvalidPasswordError if new password is same as current', async () => {
        userRepoReader.getUserByEmail.mockResolvedValue(mockUser);
        bcrypter.compare.mockResolvedValue(true);

        await expect(useCase.restoreForgottenPasswordUseCase('test@example.com', 'hashed-password'))
            .rejects.toThrow(InvalidPasswordError);
    });
});
