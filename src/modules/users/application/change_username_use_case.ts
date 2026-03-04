import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Username} from "../domain/Username";
import {UsernameAlreadyExistsError} from "../errors/username_errors";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {UsernameAlreadyExistDatabaseError} from "../errors/user_database_error";


export class ChangeUsernameUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
                private readonly mapper: UserMapper,
                private readonly userLookup: UserLookup
    ) {}



    private async checkUserWithSameUsername(username: string) {
        const user = await this.userRepoReader.getUserByUsername(username);
        if (user) {
            throw new UsernameAlreadyExistsError(`Username: ${username} already exists`);
        }
    }

    async changeUsernameUseCase(actorId: string, newUsername: string) {
        try {
            const usernameValid = Username.create(newUsername);

            const user = await this.userLookup.getUserOrThrow(actorId);

            await this.checkUserWithSameUsername(usernameValid.getValue());

            user.setUsername(usernameValid);

            const saved = await this.userRepoWriter.save(user);

            return this.mapper.mapToDto(saved)
        } catch (error) {
            if (error instanceof UsernameAlreadyExistDatabaseError) {
                throw new UsernameAlreadyExistsError(`Your chosen username already exists!`);
            }
            throw error;
        }
    }
}