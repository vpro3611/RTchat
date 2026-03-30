import {UserToUserBlocksInterface} from "../ports/user_to_user_blocks_interface";
import {UserLookup} from "../shared/user_exists_by_id";
import {UserMapper} from "../shared/map_to_dto";


export class GetFullBlackListUseCase {
    constructor(private readonly userToUserBlocksInterface: UserToUserBlocksInterface,
                private readonly userLookup: UserLookup,
                private readonly userMapper: UserMapper,
    ) {}

    async getFullBlackListUseCase(actorId: string) {
        const user = await this.userLookup.getUserOrThrow(actorId);
        user.ensureIsVerifiedAndActive();

        const blackList = await this.userToUserBlocksInterface.getFullBlacklist(actorId);

        return blackList.map(blockedUser => this.userMapper.mapToDto(blockedUser));
    }
}