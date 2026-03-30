import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {
    ConversationRequestsNotFoundError
} from "../../errors/conversation_requests_errors/conversation_requests_errors";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {ConversationRequests} from "../../domain/conversation_requests/conversation_requests";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {InsufficientPermissionsError} from "../../errors/participants_errors/participant_errors";


export class GetSpecificRequestUserUseCase {
    constructor(private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly userRepoReader: UserRepoReader,
                private readonly mapToRequestDto: MapToRequestDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async ensureUserExists(userId: string) {
        const user = await this.userRepoReader.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }

    private async ensureRequestExists(requestId: string) {
        const request = await this.conversationRequestsRepo.getRequestById(requestId);
        if (!request) {
            throw new ConversationRequestsNotFoundError("Request not found");
        }
        return request;
    }

    private ensureReqNotDeleted(request: ConversationRequests) {
        if (request.getIsDeleted()) {
            throw new ConversationRequestsNotFoundError("Request has been deleted");
        }
    }

    private ensureIsRequestOwner(request: ConversationRequests, userId: string) {
        if (request.getUserId() !== userId) {
            throw new InsufficientPermissionsError("You are not allowed to view this request");
        }
    }

    async getSpecificRequestUserUseCase(actorId: string, requestId: string) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        const cacheKey = `conv_request:specific:${requestId}`;

        return await this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const request = await this.ensureRequestExists(requestId);
                this.ensureReqNotDeleted(request);
                this.ensureIsRequestOwner(request, actorId);

                return this.mapToRequestDto.mapToRequestDto(request);
            }
        );
    }
}