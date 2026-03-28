import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { ConversationRepoInterface } from "../../domain/ports/conversation_repo_interface";
import { ParticipantRepoInterface } from "../../domain/ports/participant_repo_interface";
import { Avatar } from "../../domain/avatar/avatar";
import { ImageProcessorInterface } from "../../domain/ports/image_processor_interface";
import { ConversationNotFoundError } from "../../errors/conversation_errors/conversation_errors";
import { ParticipantRole } from "../../domain/participant/participant_role";
import { InsufficientPermissionsError } from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";

export class SetConversationAvatarUseCase {
    constructor(
        private readonly conversationRepo: ConversationRepoInterface,
        private readonly participantRepo: ParticipantRepoInterface,
        private readonly avatarRepo: AvatarRepoInterface,
        private readonly imageProcessor: ImageProcessorInterface,
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
            throw new InsufficientPermissionsError("Only the owner can set the conversation avatar");
        }
        return participant;
    }

    private async invalidateConversationCache() {
        // Поскольку мы не знаем всех участников, мы просто инвалидируем все кэши списков бесед
        // В реальном приложении лучше получить список ID участников и инвалидировать точечно.
        await this.cacheService.delByPattern("conv:user:*");
    }

    async execute(conversationId: string, userId: string, fileBuffer: Buffer): Promise<string> {
        const conversation = await this.ensureConversationExists(conversationId);

        const participant = await this.ensureUserIsParticipant(conversationId, userId);

        const oldAvatarId = conversation.getAvatarId();

        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);

        await this.conversationRepo.updateAvatarId(conversationId, newAvatarId);

        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }

        await this.invalidateConversationCache();

        return newAvatarId;
    }
}
