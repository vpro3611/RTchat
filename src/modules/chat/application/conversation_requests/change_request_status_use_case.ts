import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../errors/participants_errors/participant_errors";

import {
    ConversationReqStatus,
    ConversationRequests,
    ConversationRequestsStatus
} from "../../domain/conversation_requests/conversation_requests";
import {Participant} from "../../domain/participant/participant";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {
    CannotPerformActionOverReqError,
    ConversationRequestsNotFoundError
} from "../../errors/conversation_requests_errors/conversation_requests_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class ChangeRequestStatusUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly requestMapper: MapToRequestDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async ensureIsParticipant(conversationId: string, actorId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return participant;
    }

    private ensureIsOwner(participant: Participant) {
        if (participant.getRole() !== "owner") {
            throw new InsufficientPermissionsError("User is not an owner of the conversation");
        }
    }

    private async getSpecificRequest(conversationId: string, requestId: string) {
        const request = await this.conversationRequestsRepo.getSpecificRequest(requestId, conversationId);
        if (!request) {
            throw new ConversationRequestsNotFoundError("Request not found");
        }
        return request;
    }

    private ensureIsSameConv(request: ConversationRequests, conversationId: string) {
        if (request.getConversationId() !== conversationId) {
            throw new CannotPerformActionOverReqError("Request not found in this conversation");
        }
    }

    private ensureIsPending(request: ConversationRequests) {
        if (request.getStatus() !== "pending") {
            throw new CannotPerformActionOverReqError("Request is not pending");
        }
    }

    private ensureIsNotDeleted(request: ConversationRequests) {
        if (request.getIsDeleted() ) {
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

    private async invalidateParticipantCaches(conversationId: string, userId: string) {
        await Promise.all([
            this.cacheService.del(`participants:conv:${conversationId}`),
            this.cacheService.delByPattern(`conv:user:${userId}:*`),
        ]);
    }

    async changeRequestStatusUseCase(
        actorId: string,
        conversationId: string,
        requestId: string,
        reviewMessage: string,
        status: ConversationReqStatus
    ) {
        const participant = await this.ensureIsParticipant(conversationId, actorId);
        this.ensureIsOwner(participant);

        const request = await this.getSpecificRequest(conversationId, requestId);

        this.ensureIsPending(request);
        this.ensureIsNotDeleted(request);
        this.ensureIsSameConv(request, conversationId);

        const updated = await this.conversationRequestsRepo.updateRequest(
            requestId,
            conversationId,
            status,
            reviewMessage,
        );

        if (status === ConversationRequestsStatus.ACCEPTED) {
            const newParticipant = Participant.createAsMember(conversationId, request.getUserId());
            await this.participantRepo.save(newParticipant);
            await this.invalidateParticipantCaches(conversationId, request.getUserId());
        }

        await this.invalidateCaches(conversationId, request.getUserId(), requestId);

        return this.requestMapper.mapToRequestDto(updated);

    }
}