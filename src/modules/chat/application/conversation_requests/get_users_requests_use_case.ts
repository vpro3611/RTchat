import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {ConversationReqStatus} from "../../domain/conversation_requests/conversation_requests";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";

export class GetUsersRequestsUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly mapToRequestDto: MapToRequestDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    async ensureUserExists(userId: string) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }

    async getUsersRequestsUseCase(actorId: string, status?: ConversationReqStatus) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        const cacheKey = `conv_requests:user:${actorId}:${status ?? 'all'}`;

        return await this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const requests = await this.conversationRequestsRepo.getUsersRequests(actorId, status);

                return requests
                    .filter((r) => !r.getIsDeleted())
                    .map((r) => this.mapToRequestDto.mapToRequestDto(r));
            }
        );
    }
}