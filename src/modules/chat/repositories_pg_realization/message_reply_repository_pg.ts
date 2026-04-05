import {Pool, PoolClient} from "pg";
import {MessageReplyRepoInterface} from "../domain/ports/message_reply_repo_interface";

export class MessageReplyRepositoryPg implements MessageReplyRepoInterface {
    constructor(private readonly pg: Pool | PoolClient) {}

    async create(data: {
        messageId: string,
        parentMessageId: string,
        parentContentSnippet: string,
        parentSenderId: string,
        conversationId: string,
        repliedBy: string
    }): Promise<void> {
        await this.pg.query(
            `INSERT INTO message_replies 
            (message_id, parent_message_id, parent_content_snippet, parent_sender_id, conversation_id, replied_by)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [data.messageId, data.parentMessageId, data.parentContentSnippet, data.parentSenderId, data.conversationId, data.repliedBy]
        );
    }
}
