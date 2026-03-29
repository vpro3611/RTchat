
import { ResetUserStatusToTrueUseCase } from "../../../src/modules/users/application/reset_user_status_to_true_use_case";
import { User } from "../../../src/modules/users/domain/user";
import { UserNotFoundError } from "../../../src/modules/users/errors/use_case_errors";
import { ConflictError } from "../../../src/http_errors_base";

describe("ResetUserStatusToTrueUseCase", () => {
    let writer: any;
    let reader: any;
    let mapper: any;
    let sendEmailVerifShared: any;
    let emailVerificationService: any;
    let useCase: ResetUserStatusToTrueUseCase;

    beforeEach(() => {
        writer = {
            setPendingIsActive: jest.fn(),
        };
        reader = {
            getUserByEmail: jest.fn(),
        };
        mapper = {
            mapToDto: jest.fn(),
        };
        sendEmailVerifShared = {
            sendIt: jest.fn(),
        };
        emailVerificationService = {
            deleteByUserIdAndType: jest.fn(),
        };

        useCase = new ResetUserStatusToTrueUseCase(
            writer,
            reader,
            mapper,
            sendEmailVerifShared,
            emailVerificationService
        );
    });

    function createUser(isActive: boolean) {
        return User.restore(
            "user-id",
            "username",
            "test@mail.com",
            "hash",
            isActive,
            true,
            new Date(),
            new Date(),
            new Date()
        );
    }

    it("should initiate account reactivation", async () => {
        const user = createUser(false);
        reader.getUserByEmail.mockResolvedValue(user);
        mapper.mapToDto.mockReturnValue({ id: "user-id" });

        const result = await useCase.resetUserStatusUseCase("test@mail.com");

        expect(reader.getUserByEmail).toHaveBeenCalledWith("test@mail.com");
        expect(emailVerificationService.deleteByUserIdAndType).toHaveBeenCalledWith(user.id, "reset-activity");
        expect(writer.setPendingIsActive).toHaveBeenCalledWith(user.id);
        expect(sendEmailVerifShared.sendIt).toHaveBeenCalledWith(
            "test@mail.com",
            user,
            "/public/confirm-reset-activity",
            "reset-activity"
        );
        expect(result).toEqual({ id: "user-id" });
    });

    it("should throw UserNotFoundError if user not found", async () => {
        reader.getUserByEmail.mockResolvedValue(null);

        await expect(useCase.resetUserStatusUseCase("none@mail.com")).rejects.toThrow(UserNotFoundError);
    });

    it("should throw ConflictError if user is already active", async () => {
        const user = createUser(true);
        reader.getUserByEmail.mockResolvedValue(user);

        await expect(useCase.resetUserStatusUseCase("test@mail.com")).rejects.toThrow(ConflictError);
    });
});
