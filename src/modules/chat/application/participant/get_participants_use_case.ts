import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";


export class GetParticipantsUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly participantMapper: MapToParticipantDto,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async actorIsParticipant(conversationId: string, actorId: string) {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }

    async getParticipantsUseCase(actorId: string, conversationId: string, limit?: number, cursor?: string) {
        await this.actorIsParticipant(conversationId, actorId);

        const cacheKey =
            `participants:conv:${conversationId}:limit:${limit ?? 20}:cursor:${cursor ?? "start"}`;

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.participantRepo.getParticipants(
                    conversationId,
                    limit,
                    cursor
                );

                return {
                    items: result.items.map(participant => this.participantMapper.mapToParticipantDto(participant)),
                    nextCursor: result.nextCursor,
                };
            }
        );
    }
}