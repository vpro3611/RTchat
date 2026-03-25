import {UserToUserBlocksInterface} from "../ports/user_to_user_blocks_interface";
import {UserRepoReader} from "../ports/user_repo_interfaces";
import {BlockUserError, CannotBlockYourselfError, UserNotFoundError} from "../errors/use_case_errors";
import {UserMapper} from "../shared/map_to_dto";


export class BlockSpecificUserUseCase {
    constructor(private readonly userToUserBlocksRepo: UserToUserBlocksInterface,
                private readonly userRepoReader: UserRepoReader,
                private readonly userMapper: UserMapper,
    ) {}

    private checkForSelf(actorId: string, targetId: string) {
        if (actorId === targetId) {
            throw new CannotBlockYourselfError('You cannot block yourself');
        }
    }

    private async relationExists(actorId: string, targetId: string) {
        const relation = await this.userToUserBlocksRepo.ensureBlockedExists(
            actorId,
            targetId,
        )
        return relation;
    }

    private async checkActor(actorId: string) {
        const actor = await this.userRepoReader.getUserById(actorId);
        if (!actor) {
            throw new UserNotFoundError('User not found');
        }
        return actor;
    }

    private checkRelation(relation: boolean) {
        if (relation) {
            throw new BlockUserError("Failed to block user, user already blocked by you")
        }
    }

    async blockSpecificUserUseCase(actorId: string, targetId: string) {
        this.checkForSelf(actorId, targetId);

        const actor = await this.checkActor(actorId);
        actor.ensureIsVerifiedAndActive();

        const relation = await this.relationExists(actorId, targetId);
        this.checkRelation(relation);

        const result = await this.userToUserBlocksRepo.blockSpecificUser(
            actorId,
            targetId,
        );
        return this.userMapper.mapToDto(result);
    }
}