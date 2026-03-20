import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Username} from "../domain/Username";
import {Email} from "../domain/email";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypter/bcrypt_interface";
import {User} from "../domain/user";
import {Password} from "../domain/password";
import {UserDTO} from "../DTO/user_dto";
import {UsernameAlreadyExistsError} from "../errors/username_errors";
import {EmailAlreadyExistsError} from "../errors/email_errors";
import {
    EmailSenderInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_sender_interface";
import * as crypto from "node:crypto";
import {
    EmailVerificationInterface
} from "../../infrasctructure/ports/email_verif_infra/email_verification/email_verification_interface";
import {UserMapper} from "../shared/map_to_dto";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";


export class RegisterUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly bcrypter: BcryptInterface,
                private readonly mapper: UserMapper,
                private readonly sendVerifEmailShared: SendVerifEmailShared,
    ) {}


    private async checkForUsername(username: string) {
        const usernameDetect = await this.userRepoReader.getUserByUsername(username);
        if (usernameDetect) {
            throw new UsernameAlreadyExistsError(`Username: ${username} already exists`);
        }
    }

    private async checkForEmail(email: string) {
        const emailDetect = await this.userRepoReader.getUserByEmail(email);
        if (emailDetect) {
            throw new EmailAlreadyExistsError(`Email: ${email} already exists`);
        }
    }


    async registerUseCase(username: string, email: string, password: string): Promise<UserDTO> {
        const usernameValid = Username.create(username);

        const emailValid = Email.create(email);

        const passwordValid = Password.validatePlain(password);

        await this.checkForUsername(usernameValid.getValue());

        await this.checkForEmail(emailValid.getValue());

        const passwordHash = await this.bcrypter.hash(passwordValid);

        const user = User.create(usernameValid, emailValid, Password.fromHash(passwordHash));

        const saved = await this.userRepoWriter.save(user);

        await this.sendVerifEmailShared.sendIt(emailValid.getValue(), saved, "/public/verify-email", "register");

        // const rawToken = crypto.randomBytes(32).toString('hex');
        //
        // const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        //
        // await this.emailVerificationRepo.saveToken({
        //     id: crypto.randomUUID(),
        //     userId: saved.id,
        //     tokenHash: tokenHash,
        //     createdAt: new Date(),
        //     expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        // })
        //
        // await this.emailSender.sendVerificationEmail(emailValid.getValue(), rawToken);

        return this.mapper.mapToDto(saved);
    }
}