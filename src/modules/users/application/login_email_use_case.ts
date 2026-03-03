import {UserRepoReader} from "../ports/user_repo_interfaces";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypter/bcrypt_interface";
import {Email} from "../domain/email";
import {Password} from "../domain/password";
import {InvalidCredentialsError, UserNotFoundError} from "../errors/use_case_errors";
import {UserMapper} from "../shared/map_to_dto";


export class LoginEmailUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly bcrypter: BcryptInterface,
                private readonly mapper: UserMapper
    ) {}

    private async userExists(email: string) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (!user) {
            throw new UserNotFoundError('User not found');
        }
        return user;
    }

    private async passwordComparison(password: string, hash: string) {
        const comparePasswords = await this.bcrypter.compare(password, hash);
        if (!comparePasswords) {
            throw new InvalidCredentialsError('Invalid credentials');
        }
    }


    async loginByEmailUseCase(email: string, password: string) {
        const emailValid = Email.create(email);

        const passwordValid = Password.validatePlain(password);

        const user = await this.userExists(emailValid.getValue());

        user.canLogin();

        await this.passwordComparison(passwordValid, user.getPassword().getHash());

        return this.mapper.mapToDto(user);
    }
}