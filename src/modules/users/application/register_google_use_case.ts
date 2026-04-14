import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Username} from "../domain/Username";
import {Email} from "../domain/email";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypter/bcrypt_interface";
import {User} from "../domain/user";
import {Password} from "../domain/password";
import {UserDTO} from "../DTO/user_dto";
import {UsernameAlreadyExistsError} from "../errors/username_errors";
import {EmailAlreadyExistsError} from "../errors/email_errors";
import {TokenServiceInterface} from "../../authentification/ports/token_service_interface";
import {UserMapper} from "../shared/map_to_dto";

export class RegisterGoogleUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly bcrypter: BcryptInterface,
                private readonly mapper: UserMapper,
                private readonly tokenService: TokenServiceInterface,
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

    async registerGoogleUseCase(username: string, password: string, registrationToken: string): Promise<UserDTO> {
        // Validate registration token and extract email
        const payload = this.tokenService.verifyRegistrationToken(registrationToken);
        const email = payload.email;

        const usernameValid = Username.create(username);
        const emailValid = Email.create(email);
        const passwordValid = Password.validatePlain(password);

        await this.checkForUsername(usernameValid.getValue());
        await this.checkForEmail(emailValid.getValue());

        const passwordHash = await this.bcrypter.hash(passwordValid);

        const user = User.create(usernameValid, emailValid, Password.fromHash(passwordHash));
        
        // Since Google verified the email, we mark it as verified immediately
        user.setIsActiveTo(true); // By default it is true in create(), but just to be sure
        
        const saved = await this.userRepoWriter.save(user);
        
        // Update user to verified directly
        await this.userRepoWriter.markAsVerified(saved.id);
        
        // Load the updated user back from DB
        const verifiedUser = await this.userRepoReader.getUserById(saved.id);

        return this.mapper.mapToDto(verifiedUser!);
    }
}
