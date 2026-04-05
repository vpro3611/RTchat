# Design Spec: Reply to Message Feature

**Date:** 2026-04-05  
**Topic:** Message Replies  
**Status:** Draft

## 1. Overview
This feature allows users to reply to a specific message in a conversation. Replies are stored as standard messages in the `messages` table, with a link and metadata stored in a separate `message_replies` table for efficient UI rendering.

## 2. Database Changes
Update the `message_replies` table (replacing or altering the existing migration):

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `message_id` | UUID | PK, FK (messages.id) | The ID of the reply message itself |
| `parent_message_id` | UUID | FK (messages.id) | The ID of the message being replied to |
| `parent_content_snippet` | TEXT | NOT NULL | Cached content snippet for UI rendering |
| `parent_sender_id` | UUID | FK (users.id) | The ID of the original message sender |
| `conversation_id` | UUID | FK (conversations.id) | Safety/indexing optimization |
| `replied_by` | UUID | FK (users.id) | User who sent the reply |
| `replied_at` | TIMESTAMPTZ | NOT NULL | Timestamp of the reply |

## 3. Domain Model
### `src/modules/chat/domain/message/message.ts`
```typescript
export interface ReplyMetadata {
    parentMessageId: string;
    parentContentSnippet: string;
    parentSenderId: string;
}

export class Message {
    constructor(
        // ... existing fields
        private readonly replyMetadata?: ReplyMetadata
    ) {}
    
    // Update restore() and create()
    getReplyMetadata = () => this.replyMetadata;
}
```

## 4. Application Logic
### `SendMessageUseCase`
- **New Input:** `parentMessageId?: string`.
- **Process:**
  1. If `parentMessageId` is provided, fetch the parent message via `messageRepo`.
  2. Validate that the parent message exists and belongs to the same conversation.
  3. Extract a snippet (e.g., first 100 characters).
  4. Pass `ReplyMetadata` to `Message.create()`.

## 5. Infrastructure (Repository)
### `MessageRepositoryPg`
- **Create:** If `message.getReplyMetadata()` exists, insert into `message_replies` within the same transaction.
- **Find:** Use `LEFT JOIN message_replies r ON messages.id = r.message_id` to fetch reply metadata in one go.

## 6. API / DTO
### `MessageDTO`
```typescript
export interface MessageDTO {
    id: string;
    // ...
    replyTo?: {
        id: string;
        snippet: string;
        senderId: string;
    };
}
```

## 7. Error Handling
- `ParentMessageNotFoundError`: If `parentMessageId` is provided but message doesn't exist.
- `MessageConversationMismatchError`: If replying to a message from a different conversation.

## 8. Verification Strategy
- **Unit Tests:** `Message` entity handles metadata correctly. `SendMessageUseCase` extracts snippets.
- **Integration Tests:** `MessageRepositoryPg` correctly saves and restores reply relationships.
- **E2E Tests:** Sending a reply via controller and verifying the response contains `replyTo` data.
