import {UserRepoReader, UserRepoWriter} from "../ports/user_repo_interfaces";
import {SHAREDmapToDto} from "../shared/map_to_dto";
import {SHAREDUserExistsById} from "../shared/user_exists_by_id";


export class ToggleIsActiveUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly userRepoWriter: UserRepoWriter
    ) {}



    async toggleIsActiveUseCase(actorId: string) {
        const user = await SHAREDUserExistsById(actorId, this.userRepoReader);

        user.setIsActive();

        const saved = await this.userRepoWriter.save(user);

        return SHAREDmapToDto(saved);
    }
}