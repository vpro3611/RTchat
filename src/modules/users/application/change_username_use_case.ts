import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {Username} from "../domain/Username";
import { SHAREDmapToDto} from "../shared/map_to_dto";
import {SHAREDUserExistsById} from "../shared/user_exists_by_id";
import {UsernameAlreadyExistsError} from "../errors/username_errors";


export class ChangeUsernameUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter,
    ) {}



    private async checkUserWithSameUsername(username: string) {
        const user = await this.userRepoReader.getUserByUsername(username);
        if (user) {
            throw new UsernameAlreadyExistsError(`Username: ${username} already exists`);
        }
    }

    async changeUsernameUseCase(actorId: string, newUsername: string) {
        const usernameValid = Username.create(newUsername);

        const user = await SHAREDUserExistsById(actorId, this.userRepoReader);

        await this.checkUserWithSameUsername(usernameValid.getValue());

        user.ensureIsActive();

        user.setUsername(usernameValid);

        const saved = await this.userRepoWriter.save(user);

        return SHAREDmapToDto(saved)
    }
}