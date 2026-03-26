import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {
    ConversationRequestsNotFoundError
} from "../../errors/conversation_requests_errors/conversation_requests_errors";
import {ConversationRequests} from "../../domain/conversation_requests/conversation_requests";
import {Participant} from "../../domain/participant/participant";
import {InsufficientPermissionsError} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class GetSpecificRequestGroupUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly requestMapper: MapToRequestDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async ensureIsParticipant(actorId: string, conversationId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!participant) {
            throw new ConversationRequestsNotFoundError("User is not a member of the conversation");
        }
        return participant;
    }

    private ensureIsOwner(actor: Participant) {
        if (actor.getRole() !== "owner") {
            throw new InsufficientPermissionsError("User is not an owner of the conversation");
        }
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

    private ensureIsSameConv(request: ConversationRequests, conversationId: string) {
        if (request.getConversationId() !== conversationId) {
            throw new ConversationRequestsNotFoundError("Request not found in this conversation");
        }
    }


    async getSpecificRequestGroupUseCase(actorId: string, conversationId: string, requestId: string) {
        const actor = await this.ensureIsParticipant(actorId, conversationId);
        this.ensureIsOwner(actor);

        const cacheKey = `conv_request:specific:${requestId}`;

        return await this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const request = await this.ensureRequestExists(requestId);
                this.ensureReqNotDeleted(request);
                this.ensureIsSameConv(request, conversationId);

                return this.requestMapper.mapToRequestDto(request);
            }
        );
    }
}