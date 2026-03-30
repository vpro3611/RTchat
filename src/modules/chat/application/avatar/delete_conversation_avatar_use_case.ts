import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { ConversationRepoInterface } from "../../domain/ports/conversation_repo_interface";
import { ParticipantRepoInterface } from "../../domain/ports/participant_repo_interface";
import { ConversationNotFoundError } from "../../errors/conversation_errors/conversation_errors";
import { ParticipantRole } from "../../domain/participant/participant_role";
import { InsufficientPermissionsError } from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";

export class DeleteConversationAvatarUseCase {
    constructor(
        private readonly conversationRepo: ConversationRepoInterface,
        private readonly participantRepo: ParticipantRepoInterface,
        private readonly avatarRepo: AvatarRepoInterface,
        private readonly cacheService: CacheServiceInterface
    ) {}

    private async ensureConversationExists(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }
        return conversation;
    }

    private async ensureUserIsParticipant(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findParticipant(conversationId, userId);
        if (!participant || participant.getRole() !== ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("Only the owner can delete the conversation avatar");
        }
    }

    async execute(conversationId: string, userId: string): Promise<void> {
        const conversation = await this.ensureConversationExists(conversationId);

        await this.ensureUserIsParticipant(conversationId, userId);

        const avatarId = conversation.getAvatarId();
        if (!avatarId) return;

        await this.conversationRepo.updateAvatarId(conversationId, null);
        await this.avatarRepo.delete(avatarId);
        
        await this.cacheService.delByPattern("conv:user:*");
    }
}
