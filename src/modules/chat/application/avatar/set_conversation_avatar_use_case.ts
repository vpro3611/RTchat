import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { ConversationRepoInterface } from "../../domain/ports/conversation_repo_interface";
import { ParticipantRepoInterface } from "../../domain/ports/participant_repo_interface";
import { Avatar } from "../../domain/avatar/avatar";
import { ImageProcessorInterface } from "../../domain/ports/image_processor_interface";
import { ConversationNotFoundError } from "../../errors/conversation_errors/conversation_errors";
import { ParticipantRole } from "../../domain/participant/participant_role";
import { InsufficientPermissionsError } from "../../errors/participants_errors/participant_errors";

export class SetConversationAvatarUseCase {
    constructor(
        private readonly conversationRepo: ConversationRepoInterface,
        private readonly participantRepo: ParticipantRepoInterface,
        private readonly avatarRepo: AvatarRepoInterface,
        private readonly imageProcessor: ImageProcessorInterface
    ) {}

    async execute(conversationId: string, userId: string, fileBuffer: Buffer): Promise<string> {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new ConversationNotFoundError("Conversation not found");
        }

        const participant = await this.participantRepo.findParticipant(conversationId, userId);
        if (!participant || participant.getRole() !== ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("Only the owner can set the conversation avatar");
        }

        const oldAvatarId = conversation.getAvatarId();

        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);

        await this.conversationRepo.updateAvatarId(conversationId, newAvatarId);

        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }

        return newAvatarId;
    }
}
