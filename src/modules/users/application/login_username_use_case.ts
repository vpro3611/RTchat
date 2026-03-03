import {UserRepoReader} from "../ports/user_repo_interfaces";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypt_interface";
import {Username} from "../domain/Username";
import {Password} from "../domain/password";
import {SHAREDmapToDto} from "../shared/map_to_dto";
import {InvalidCredentialsError, UserNotFoundError} from "../errors/use_case_errors";


export class LoginUsernameUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly bcrypter: BcryptInterface
    ) {}

    private async userExists(username: string) {
        const user = await this.userRepoReader.getUserByUsername(username);
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



    async loginByUsernameUseCase(username: string, password: string) {
        const validUsername = Username.create(username);

        const validPassword = Password.validatePlain(password);

        const user = await this.userExists(validUsername.getValue());

        user.ensureIsActive();

        await this.passwordComparison(validPassword, user.getPassword().getHash());

        return SHAREDmapToDto(user);
    }
}