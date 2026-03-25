import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ConversationBans} from "../../domain/conversation_bans/conversation_bans";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../errors/participants_errors/participant_errors";
import {Participant} from "../../domain/participant/participant";
import {ParticipantRole} from "../../domain/participant/participant_role";
import {ConversationBansDTO} from "../../DTO/bans_dto";


export class GetBannedUsersUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationBanRepoInterface: ConversationBansInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async getActor(conversationId: string, actorId: string) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }

    private async ensureIsOwner(actor: Participant) {
        if (actor.getRole() !== ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }

    async getBannedUsersUseCase(conversationId: string, actorId: string): Promise<ConversationBansDTO[]> {
        const cacheKey = `bans:conv:${conversationId}`;

        const actor = await this.getActor(conversationId, actorId);
        await this.ensureIsOwner(actor);

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.conversationBanRepoInterface.getBannedUsers(conversationId);
                return result.map((c) => {
                    return {
                        conversationId: c.conversationId,
                        userId: c.userId,
                        bannedBy: c.bannedBy,
                        createdAt: c.createdAt.toISOString(),
                        reason: c.reason,
                    }
                })
            }
        )
    }
}