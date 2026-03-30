import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {NotBannedError} from "../../errors/conversation_bans_error/conversation_bans_errors";


export class UnbanGroupParticipantUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationBanRepoInterface: ConversationBansInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async invalidateParticipantsCache(conversationId: string) {
        await this.cacheService.delByPattern(`participants:conv:${conversationId}:*`);
    }

    private async invalidateUserConversations(userId: string) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }

    private async invalidateConversationBansCache(conversationId: string) {
        await this.cacheService.delByPattern(`bans:conv:${conversationId}:*`);
    }

    private async actorIsParticipant(conversationId: string, actorId: string) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }

    private async ensureTargeIsBanned(conversationId: string, userId: string) {
        const banned = await this.conversationBanRepoInterface.isBanned(conversationId, userId);
        if (!banned) {
            throw new NotBannedError("User is not banned from the conversation");
        }
    }

    async unbanGroupParticipantUseCase(conversationId: string, actorId: string, targetId: string): Promise<void> {
        const actor = await this.actorIsParticipant(conversationId, actorId);

        await this.ensureTargeIsBanned(conversationId, targetId);

        actor.canUnban(targetId);

        await this.conversationBanRepoInterface.unban(conversationId, targetId);

        await Promise.all([
            await this.invalidateParticipantsCache(conversationId),
            await this.invalidateUserConversations(targetId),
            await this.invalidateConversationBansCache(conversationId),
        ]);
    }
}