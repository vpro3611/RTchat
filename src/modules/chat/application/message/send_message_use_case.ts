import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MessageDTO} from "../../DTO/message_dto";
import {Message} from "../../domain/message/message";
import {Content} from "../../domain/message/content";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {
    UserIsNotAllowedToPerformError,
    UserIsNotParticipantError
} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantListDTO} from "../../DTO/participant_list_dto";
import {CannotCreateConversationError} from "../../errors/conversation_errors/conversation_errors";
import {UserToUserBlocksInterface} from "../../../users/ports/user_to_user_blocks_interface";
import {ConversationBansInterface} from "../../domain/ports/conversation_bans_interface";
import {Attachment, AttachmentType} from "../../domain/message/attachment";
import {FileDTO} from "../../DTO/file_dto";
import {VirusScannerInterface} from "../../domain/ports/virus_scanner_interface";
import {VideoProcessorInterface} from "../../domain/ports/video_processor_interface";
import {ImageProcessorInterface} from "../../domain/ports/image_processor_interface";
import {AudioProcessorInterface} from "../../domain/ports/audio_processor_interface";
import {BlobRepositoryPg} from "../../repositories_pg_realization/blob_repository_pg";
import {InsecureAttachmentError, InvalidMessageError} from "../../errors/message_errors/message_errors";


export class SendMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
                private readonly cacheService: CacheServiceInterface,
                private readonly participantRepo: ParticipantRepoInterface,
                private readonly userToUserBansRepo: UserToUserBlocksInterface,
                private readonly conversationBansRepo: ConversationBansInterface,
                private readonly virusScanner: VirusScannerInterface,
                private readonly videoProcessor: VideoProcessorInterface,
                private readonly imageProcessor: ImageProcessorInterface,
                private readonly audioProcessor: AudioProcessorInterface,
                private readonly blobRepo: BlobRepositoryPg,
    ) {}

    private async checkIfUserIsBannedFromGroup(actorId: string, conversationId: string) {
        const relation = await this.conversationBansRepo.isBanned(conversationId, actorId);
        if (relation) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages because of being blocked by the target user");
        }
    }

    private async invalidateCache(participants: ParticipantListDTO[]) {
        for (const p of participants) {
            await this.cacheService.delByPattern(`conv:user:${p.userId}:*`);
        }
    }

    private async checkForBlockingRelations(actorId: string, targetId: string) {
        const relation = await this.userToUserBansRepo.ensureAnyBlocksExists(actorId, targetId);
        if (relation) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages because of being blocked by the target user");
        }
    }

    private async getConversation(conversationId: string) {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            throw new CannotCreateConversationError("Conversation not found");
        }
        return conversation;
    }

    private async processAttachments(files: FileDTO[]): Promise<Attachment[]> {
        const attachments: Attachment[] = [];

        for (const file of files) {
            const isClean = await this.virusScanner.scanBuffer(file.buffer);
            if (!isClean) {
                throw new InsecureAttachmentError(`File ${file.originalname} is infected`);
            }

            let processedBuffer = file.buffer;
            let mimeType = file.mimetype;
            let type: AttachmentType = 'file';
            let duration: number | undefined = undefined;
            let originalName = file.originalname;

            if (file.mimetype.startsWith('image/')) {
                const processed = await this.imageProcessor.processImage(file.buffer);
                processedBuffer = processed.data;
                mimeType = processed.mimeType;
                type = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                processedBuffer = await this.videoProcessor.stripMetadata(file.buffer);
                type = 'video';
            } else if (
                file.mimetype === 'audio/webm' || 
                file.mimetype === 'audio/ogg' || 
                file.mimetype === 'audio/webm; codecs=opus'
            ) {
                const processed = await this.audioProcessor.processAudio(file.buffer);
                processedBuffer = processed.data;
                mimeType = processed.mimeType;
                type = 'voice';
                duration = processed.duration;

                // Correct extension if it was converted to ogg
                if (!originalName.toLowerCase().endsWith('.ogg')) {
                    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                    originalName = `${baseName}.ogg`;
                }
            }

            const blobId = await this.blobRepo.save(processedBuffer);
            attachments.push(Attachment.create(
                blobId,
                type,
                originalName,
                mimeType,
                processedBuffer.length,
                duration
            ));
        }

        return attachments;
    }

    async sendMessageUseCase(actorId: string, conversationId: string, content: string, files: FileDTO[] = []): Promise<MessageDTO> {
        const validatedContent = Content.create(content);

        const attachments = await this.processAttachments(files);

        if (validatedContent.getContentValue().length === 0 && attachments.length === 0) {
            throw new InvalidMessageError("Message must have content or attachments");
        }

        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        if (!participant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages");
        }

        const conversation = await this.getConversation(conversationId);

        if (conversation.getConversationType() === "direct") {
            const participants = await this.participantRepo.getParticipants(conversationId);
            const target = participants.items.find(p => p.userId !== actorId);
            if (!target) {
                throw new UserIsNotParticipantError("User is not a participant of the conversation." +
                    " Cannot send message to a direct conversation without a target user");
            }
            await this.checkForBlockingRelations(actorId, target.userId);
        }

        if (conversation.getConversationType() === "group") {
            await this.checkIfUserIsBannedFromGroup(actorId, conversationId);
        }

        const message = Message.create(
            conversationId,
            actorId,
            validatedContent,
            attachments
        );

        await this.messageRepo.create(message);

        await this.conversationRepo.updateLastMessage(conversationId, message.getCreatedAt());

        // invalidate cache messages
        await this.cacheService.delByPattern(`messages:${conversationId}:*`);

        const participants = await this.participantRepo.getParticipants(conversationId);

        // invalidate user conversation list
        await this.invalidateCache(participants.items);

        const maxReadAt = await this.conversationRepo.getMaxReadAtForOthers(conversationId, actorId);

        return this.messageMapper.mapToMessage(message, maxReadAt);
        }
        }