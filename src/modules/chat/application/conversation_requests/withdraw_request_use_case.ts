import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {
    CannotPerformActionOverReqError,
    ConversationRequestsNotFoundError
} from "../../errors/conversation_requests_errors/conversation_requests_errors";
import {
    ConversationRequests,
    ConversationRequestsStatus
} from "../../domain/conversation_requests/conversation_requests";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class WithdrawRequestUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
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


    private async ensureRequestExists(requestId: string, ) {
        const request = await this.conversationRequestsRepo.getRequestById(
            requestId,
        );

        if (!request) {
            throw new ConversationRequestsNotFoundError("Request not found");
        }

        return request;
    }

    private ensureIsPending(request: ConversationRequests) {
        if (request.getStatus() !== "pending") {
            throw new CannotPerformActionOverReqError("Request is not pending");
        }
    }

    private ensureIsNotDeleted(request: ConversationRequests) {
        if (request.getIsDeleted()) {
            throw new CannotPerformActionOverReqError("Request has been deleted");
        }
    }

    private async invalidateCaches(conversationId: string, userId: string, requestId: string) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
            this.cacheService.del(`conv_request:specific:${requestId}`),
        ]);
    }

    async withdrawRequestUseCase(actorId: string, requestId: string) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        const request = await this.ensureRequestExists(requestId);
        this.ensureIsNotDeleted(request);
        this.ensureIsPending(request);

        const changedReq = await this.conversationRequestsRepo.updateRequest(
            requestId,
            request.getConversationId(),
            ConversationRequestsStatus.WITHDRAWN,
            `Request has been withdrawn by user (initiator): ${user.getUsername().getValue()}`
        );

        await this.invalidateCaches(request.getConversationId(), actorId, requestId);

        return this.mapToRequestDto.mapToRequestDto(changedReq);
    }
}