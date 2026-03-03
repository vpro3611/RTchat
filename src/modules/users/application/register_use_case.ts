import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Username} from "../domain/Username";
import {Email} from "../domain/email";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypt_interface";
import {User} from "../domain/user";
import {Password} from "../domain/password";
import {UserDTO} from "../infrastructure/user_dto";
import {SHAREDmapToDto} from "../shared/map_to_dto";
import {UsernameAlreadyExistsError} from "../errors/username_errors";
import {EmailAlreadyExistsError} from "../errors/email_errors";


export class RegisterUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly bcrypter: BcryptInterface,
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

        return SHAREDmapToDto(saved);
    }
}