import {MessageRepoInterface} from "../../domain/ports/message_repo_interface";
import {MapToMessage} from "../../shared/map_to_message";
import {CheckIsParticipant} from "../../shared/is_participant";


export class GetMessagesUseCase {
    constructor(private readonly messageRepo: MessageRepoInterface,
                private readonly messageMapper: MapToMessage,
                private readonly checkIsParticipant: CheckIsParticipant
    ) {}

    async getMessagesUseCase(actorId: string, conversationId: string, limit?: number, cursor?: string) {
        const participant = await this.checkIsParticipant.checkIsParticipant(actorId, conversationId);
        const result = await this.messageRepo.findByConversationId(conversationId, limit, cursor);
        return {
            items: result.items.map(message => this.messageMapper.mapToMessage(message)),
            nextCursor: result.nextCursor,
        }
    }
}