import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Email} from "../domain/email";
import {SHAREDmapToDto} from "../shared/map_to_dto";
import {SHAREDUserExistsById} from "../shared/user_exists_by_id";
import {EmailAlreadyExistsError} from "../errors/email_errors";


export class ChangeEmailUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter
    ) {}



    private async checkUserWithSameEmail(email: string) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (user) {
            throw new EmailAlreadyExistsError(`User with this email: ${email} already exists`);
        }
    }

    async changeEmailUseCase(actorId: string, newEmail: string) {
        const newEmailValid = Email.create(newEmail);

        const user = await SHAREDUserExistsById(actorId, this.userRepoReader);

        await this.checkUserWithSameEmail(newEmailValid.getValue());

        user.ensureIsActive();

        user.setEmail(newEmailValid);

        const saved = await this.userRepoWriter.save(user);

        return SHAREDmapToDto(saved);
    }
}