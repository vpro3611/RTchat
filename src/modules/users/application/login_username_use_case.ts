import {UserRepoReader} from "../ports/user_repo_interfaces";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypter/bcrypt_interface";
import {Username} from "../domain/Username";
import {Password} from "../domain/password";
import {InvalidCredentialsError, UserNotFoundError} from "../errors/use_case_errors";
import {UserMapper} from "../shared/map_to_dto";


export class LoginUsernameUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly bcrypter: BcryptInterface,
                private readonly mapper: UserMapper
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

        user.canLogin();

        await this.passwordComparison(validPassword, user.getPassword().getHash());

        return this.mapper.mapToDto(user);
    }
}