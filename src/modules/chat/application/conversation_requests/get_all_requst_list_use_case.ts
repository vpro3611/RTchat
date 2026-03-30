import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationRequestsInterface} from "../../domain/ports/conversation_requests_interface";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../errors/participants_errors/participant_errors";
import {Participant} from "../../domain/participant/participant";
import {ParticipantRole} from "../../domain/participant/participant_role";
import {MapToRequestDto} from "../../shared/map_to_request_dto";
import {ConversationReqStatus} from "../../domain/conversation_requests/conversation_requests";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class GetAllRequestListUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationRequestsRepo: ConversationRequestsInterface,
                private readonly requestMapper: MapToRequestDto,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async actorIsParticipant(conversationId: string, actorId: string): Promise<Participant> {
        const exists = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return exists;
    }

    private ensureIsOwner(participant: Participant) {
        if (participant.getRole() !== ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("User is not an owner of the conversation");
        }
    }

    async getAllRequestsListUseCase(actorId: string, conversationId: string, status?: ConversationReqStatus) {
        const actor = await this.actorIsParticipant(conversationId, actorId);
        this.ensureIsOwner(actor);

        const cacheKey = `conv_requests:group:${conversationId}:${status ?? 'all'}`;

        return await this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.conversationRequestsRepo.getRequests(conversationId, status);
                return result.map((r) => this.requestMapper.mapToRequestDto(r));
            }
        );
    }
}