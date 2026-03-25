import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../errors/participants_errors/participant_errors";
import {Participant} from "../../domain/participant/participant";
import {ConversationBans} from "../../domain/conversation_bans/conversation_bans";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class BanGroupParticipantUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly conversationBanRepoInterface: ConversationBansInterface,
                private readonly cacheService: CacheServiceInterface,
    ) {}

    private async targetIsParticipant(conversationId: string, targetId: string) {
        const target = await this.participantRepo.findParticipant(conversationId, targetId);
        if (!target) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return target;
    }

    private async actorIsParticipant(conversationId: string, actorId: string) {
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor;
    }

    private ensureCanBan(actor: Participant, target: Participant) {
        if (!actor.canBanOther(target)) {
            throw new InsufficientPermissionsError("Actor is not allowed to ban this user");
        }
    }

    private createBan(data: Omit<ConversationBans, "createdAt">): ConversationBans {
        return {
            conversationId: data.conversationId,
            userId: data.userId,
            bannedBy: data.bannedBy,
            createdAt: new Date(),
            reason: data.reason,
        }
    }

    private async invalidateParticipantsCache(conversationId: string) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
    }

    private async invalidateUserConversations(userId: string) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }

    private async invalidateConversationBansCache(conversationId: string) {
        await this.cacheService.del(`bans:conv:${conversationId}`);
    }

    async banGroupParticipantUseCase(data:
        Omit<ConversationBans, "createdAt">
    ): Promise<ConversationBans> {
        const actor = await this.actorIsParticipant(data.conversationId, data.bannedBy);

        const target = await this.targetIsParticipant(data.conversationId, data.userId);

        this.ensureCanBan(actor, target);

        const createdBan = this.createBan(data);

        await this.conversationBanRepoInterface.ban(createdBan);
        await this.participantRepo.remove(data.conversationId, data.userId);

        await Promise.all([
            await this.invalidateParticipantsCache(data.conversationId),
            await this.invalidateUserConversations(data.userId),
            await this.invalidateConversationBansCache(data.conversationId),
        ]);

        return createdBan;
    }
}