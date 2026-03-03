import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {BcryptInterface} from "../../infrasctructure/ports/bcrypt_interface";
import {Password} from "../domain/password";
import {SHAREDmapToDto} from "../shared/map_to_dto";
import {SHAREDUserExistsById} from "../shared/user_exists_by_id";
import {InvalidCredentialsError, OldPasswordNotMatchError} from "../errors/use_case_errors";


export class ChangePasswordUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly bcrypter: BcryptInterface
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

        const user = await SHAREDUserExistsById(actorId, this.userRepoReader);

        user.ensureIsActive();

        await this.comparePasswords(oldPasswordValid, user.getPassword().getHash());

        const newPasswordHash = await this.bcrypter.hash(newPasswordValid);

        user.setPassword(Password.fromHash(newPasswordHash));

        const saved = await this.userRepoWriter.save(user);

        return SHAREDmapToDto(saved);
    }
}