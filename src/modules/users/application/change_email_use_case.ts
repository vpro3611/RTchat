import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Email} from "../domain/email";
import {EmailAlreadyExistsError} from "../errors/email_errors";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";


export class ChangeEmailUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly mapper: UserMapper,
                private readonly userLookup: UserLookup
    ) {}



    private async checkUserWithSameEmail(email: string) {
        const user = await this.userRepoReader.getUserByEmail(email);
        if (user) {
            throw new EmailAlreadyExistsError(`User with this email: ${email} already exists`);
        }
    }

    async changeEmailUseCase(actorId: string, newEmail: string) {
        const newEmailValid = Email.create(newEmail);

        const user = await this.userLookup.getUserOrThrow(actorId);

        await this.checkUserWithSameEmail(newEmailValid.getValue());

        user.setEmail(newEmailValid);

        const saved = await this.userRepoWriter.save(user);

        return this.mapper.mapToDto(saved);
    }
}