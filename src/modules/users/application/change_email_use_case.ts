import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Email} from "../domain/email";
import {EmailAlreadyExistsError} from "../errors/email_errors";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {EmailAlreadyExistDatabaseError, UserDatabaseError} from "../errors/user_database_error";
import {
    EmailSenderInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_sender_interface";
import crypto from "node:crypto";
import {
    EmailVerificationInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";


export class ChangeEmailUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly mapper: UserMapper,
                private readonly userLookup: UserLookup,
                private readonly sendEmailVerifShared: SendVerifEmailShared,
    ) {}



    private async checkUserWithSameEmail(email: string) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (user) {
            throw new EmailAlreadyExistsError(`User with this email: ${email} already exists`);
        }
    }

    async changeEmailUseCase(actorId: string, newEmail: string) {
        try {
            const newEmailValid = Email.create(newEmail);

            const user = await this.userLookup.getUserOrThrow(actorId);

            await this.checkUserWithSameEmail(newEmailValid.getValue());

            await this.sendEmailVerifShared.sendIt(newEmailValid.getValue(), user,
                "/public/confirm-email-change", "change");

            await this.userRepoWriter.setPendingEmail(actorId, newEmailValid.getValue());

            return this.mapper.mapToDto(user);
        } catch (error) {
            if (error instanceof EmailAlreadyExistDatabaseError) {
                throw new EmailAlreadyExistsError(`User with this email already exists`);
            }
            throw error;
        }
    }
}