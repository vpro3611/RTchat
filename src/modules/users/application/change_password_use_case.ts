import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypter/bcrypt_interface";
import {Password} from "../domain/password";
import {InvalidCredentialsError, OldPasswordNotMatchError} from "../errors/use_case_errors";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";


export class ChangePasswordUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly bcrypter: BcryptInterface,
                private readonly mapper: UserMapper,
                private readonly userLookup: UserLookup
    ) {}

    private checkPasswordDifference(oldPassword: string, newPassword: string) {
        if (oldPassword === newPassword) {
            throw new OldPasswordNotMatchError('Old password and new password must be different');
        }
    }



    private async comparePasswords(oldPassword: string, currentPassword: string) {
        const comparePasswords = await this.bcrypter.compare(oldPassword, currentPassword);
        if (!comparePasswords) {
            throw new InvalidCredentialsError('Invalid credentials');
        }
    }

    async changePasswordUseCase(actorId: string, oldPassword: string, newPassword: string) {
        const oldPasswordValid = Password.validatePlain(oldPassword);

        const newPasswordValid = Password.validatePlain(newPassword);

        this.checkPasswordDifference(oldPasswordValid, newPasswordValid);

        const user = await this.userLookup.getUserOrThrow(actorId);

        user.ensureIsVerifiedAndActive();

        await this.comparePasswords(oldPasswordValid, user.getPassword().getHash());

        const newPasswordHash = await this.bcrypter.hash(newPasswordValid);

        user.setPassword(Password.fromHash(newPasswordHash));

        const saved = await this.userRepoWriter.save(user);

        return this.mapper.mapToDto(saved);
    }
}