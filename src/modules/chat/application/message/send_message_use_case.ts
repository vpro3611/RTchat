import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MessageDTO} from "../../DTO/message_dto";
import {Message} from "../../domain/message/message";
import {Content} from "../../domain/message/content";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";
import {UserIsNotAllowedToPerformError} from "../errors/participants_errors/participant_errors";


export class SendMessageUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly conversationRepo: ConversationRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant,
    ) {}

    async sendMessageUseCase(actorId: string, conversationId: string, content: string): Promise<MessageDTO> {
        const validatedContent = Content.create(content);
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);

        if (!participant.getCanSendMessages()) {
            throw new UserIsNotAllowedToPerformError("User is not allowed to send messages");
        }

        const message = Message.create(
            conversationId,
            actorId,
            validatedContent,
        );

        await this.messageRepo.create(message);

        await this.conversationRepo.updateLastMessage(conversationId, message.getCreatedAt());

        return this.messageMapper.mapToMessage(message);
    }
}