import {UserToUserBlocksInterface} from "../ports/user_to_user_blocks_interface";
import {UserRepoReader} from "../ports/user_repo_interfaces";
import {UserMapper} from "../shared/map_to_dto";
import {CannotBlockYourselfError, UnblockUserError, UserNotFoundError} from "../errors/use_case_errors";


export class UnblockSpecificUserUseCase {
    constructor(private readonly userToUserBlocksRepo: UserToUserBlocksInterface,
                private readonly userRepoReader: UserRepoReader,
                private readonly userMapper: UserMapper
    ) {}


    private checkForSelf(actorId: string, targetId: string) {
        if (actorId === targetId) {
            throw new CannotBlockYourselfError('You cannot block yourself');
        }
    }


    private async checkActor(actorId: string) {
        const actor = await this.userRepoReader.getUserById(actorId);
        if (!actor) {
            throw new UserNotFoundError('User not found');
        }
        return actor;
    }

    private async relationExists(actorId: string, targetId: string) {
        const relation = await this.userToUserBlocksRepo.ensureBlockedExists(
            actorId,
            targetId,
        )
        return relation;
    }

    private checkRelation(relation: boolean) {
        if (!relation) {
            throw new UnblockUserError("Failed to unblock user, user not blocked by you")
        }
    }

    async unblockSpecificUserUseCase(actorId: string, targetId: string) {
        this.checkForSelf(actorId, targetId);

        const actor = await this.checkActor(actorId);
        actor.ensureIsVerifiedAndActive();

        const relation = await this.relationExists(actorId, targetId);
        this.checkRelation(relation);

        const result = await this.userToUserBlocksRepo.unblockSpecificUser(
            actorId,
            targetId,
        );
        return this.userMapper.mapToDto(result);
    }
}