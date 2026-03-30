import {UserLookup} from "../shared/user_exists_by_id";
import {UserMapper} from "../shared/map_to_dto";


export class GetSpecificUserUseCase {
    constructor(private readonly userLookup: UserLookup,
                private readonly userMapper: UserMapper,
    ) {}



    async getSpecificUserUseCase(actorId: string, targetId: string) {
        const actor = await this.userLookup.getUserOrThrow(actorId);
        actor.ensureIsVerifiedAndActive();

        const target = await this.userLookup.getUserOrThrow(targetId);
        target.ensureIsVerifiedAndActive();

        return this.userMapper.mapToDto(target);
    }
}