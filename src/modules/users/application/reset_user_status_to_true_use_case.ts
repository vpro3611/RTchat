import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {UserMapper} from "../shared/map_to_dto";
import {
    EmailVerificationInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";
import {Email} from "../domain/email";
import {UserNotFoundError} from "../errors/use_case_errors";
import {ConflictError} from "../../../http_errors_base";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";


export class ResetUserStatusToTrueUseCase {
    constructor(private readonly userRepoWriter: UserRepoWriter,
                private readonly userRepoReader: UserRepoReader,
                private readonly userMapper: UserMapper,
                private readonly sendEmailVerifShared: SendVerifEmailShared,
                private readonly emailVerificationService: EmailVerificationInterface
    ) {}

    async resetUserStatusUseCase(email: string) {
        const verifiedEmail = Email.create(email);

        const user = await this.userRepoReader.getUserByEmail(verifiedEmail.getValue());

        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        user.ensureIsVerified();

        if (user.getIsActive()) {
            throw new ConflictError('User is already active');
        }

        await this.emailVerificationService.deleteByUserIdAndType(user.id, "reset-activity");

        await this.userRepoWriter.setPendingIsActive(user.id);

        await this.sendEmailVerifShared.sendIt(
            user.getEmail().getValue(),
            user,
            "/public/confirm-reset-activity",
            "reset-activity"
        );

        return this.userMapper.mapToDto(user);
    }


}