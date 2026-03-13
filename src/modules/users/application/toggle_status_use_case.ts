import {UserRepoWriter} from "../ports/user_repo_interfaces";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";


export class ToggleIsActiveUseCase {
    constructor(
                private readonly userRepoWriter: UserRepoWriter,
                private readonly mapper: UserMapper,
                private readonly userLookup: UserLookup
    ) {}



    async toggleIsActiveUseCase(actorId: string) {
        const user = await this.userLookup.getUserOrThrow(actorId);

        user.ensureIsVerified();

        user.setIsActive();

        const saved = await this.userRepoWriter.save(user);

        return this.mapper.mapToDto(saved);
    }
}