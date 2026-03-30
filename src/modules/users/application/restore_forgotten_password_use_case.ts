import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";
import {UserMapper} from "../shared/map_to_dto";
import {UserNotFoundError} from "../errors/use_case_errors";
import {Email} from "../domain/email";
import {Password} from "../domain/password";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypter/bcrypt_interface";
import {InvalidPasswordError} from "../errors/password_errors";


import {EmailVerificationInterface} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";


export class RestoreForgottenPasswordUseCase {
    constructor(private readonly userRepoWriter: UserRepoWriter,
                private readonly userRepoReader: UserRepoReader,
                private readonly sendEmailVerifShared: SendVerifEmailShared,
                private readonly userMapper: UserMapper,
                private readonly bcrypter: BcryptInterface,
                private readonly emailVerificationService: EmailVerificationInterface,
    ) {}

    async restoreForgottenPasswordUseCase(email: string, newPassword: string) {
        const validatedEmail = Email.create(email);
        const newPasswordValid = Password.validatePlain(newPassword);
        const user = await this.userRepoReader.getUserByEmail(validatedEmail.getValue());
        if (!user) {
            throw new UserNotFoundError('User not found');
        }
        user.ensureIsVerifiedAndActive();

        const isSamePassword = await this.bcrypter.compare(newPasswordValid, user.getPassword().getHash());

        if (isSamePassword) {
            throw new InvalidPasswordError('New password must be different from the current password');
        }

        const newPasswordHash = await this.bcrypter.hash(newPasswordValid);

        // Delete old tokens of this type to ensure only the latest one works with the latest pending password
        await this.emailVerificationService.deleteByUserIdAndType(user.id, "reset-pass");

        await this.userRepoWriter.setPendingPassword(
            user.id,
            newPasswordHash
        );

        await this.sendEmailVerifShared.sendIt(
            validatedEmail.getValue(),
            user,
            "/public/confirm-reset-password",
            "reset-pass"
        );

        return this.userMapper.mapToDto(user);
    }
}