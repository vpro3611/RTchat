import {UserRepoReader} from "../../../users/ports/user_repo_interfaces";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";
import {
    CannotPerformActionOverReqError,
    ConversationRequestsNotFoundError
} from "../../errors/conversation_requests_errors/conversation_requests_errors";
import {ConversationRequestsStatus} from "../../domain/conversation_requests/conversation_requests";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class RemoveRequestUseCase {
    constructor(private readonly Reader: UserRepoReader,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async ensureUserExists(userId: string) {
        const user = await this.Reader.getUserById(userId);
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

    private async invalidateCaches(conversationId: string, userId: string, requestId: string) {
        await Promise.all([
            this.cacheService.delByPattern(`conv_requests:group:${conversationId}:*`),
            this.cacheService.delByPattern(`conv_requests:user:${userId}:*`),
            this.cacheService.del(`conv_request:specific:${requestId}`),
        ]);
    }

    async removeRequestUseCase(actorId: string, requestId: string) {
        const user = await this.ensureUserExists(actorId);
        user.ensureIsVerifiedAndActive();

        const request = await this.ensureRequestExists(requestId);

        if (request.getIsDeleted()) {
            throw new CannotPerformActionOverReqError("Request has already been deleted");
        }
        if (request.getStatus() === "pending") {
            const _ = await this.conversationRequestsRepo.updateRequest(
                requestId,
                request.getConversationId(),
                ConversationRequestsStatus.WITHDRAWN,
                `Request has been withdrawn by user (initiator): ${user.getUsername().getValue()}`
            );
        }
        await this.conversationRequestsRepo.removeRequest(requestId);
        await this.invalidateCaches(request.getConversationId(), request.getUserId(), requestId);
    }
}