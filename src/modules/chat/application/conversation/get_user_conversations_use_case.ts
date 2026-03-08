import {ConversationRepoInterface} from "../../domain/ports/conversation_repo_interface";
import {MapToConversationDto} from "../../shared/map_to_conversation_dto";


export class GetUserConversationsUseCase {
    constructor(private readonly conversationRepo: ConversationRepoInterface,
                private readonly conversationMapper: MapToConversationDto
    ) {}

    async getUserConversationsUseCase (actorId: string, limit?: number, cursor?: string) {
        const result = await this.conversationRepo.getUserConversations(actorId, limit, cursor);
        return {
            items: result.items.map(conversation => this.conversationMapper.mapToConversationDto(conversation)),
            nextCursor: result.nextCursor,
        }
    }
}