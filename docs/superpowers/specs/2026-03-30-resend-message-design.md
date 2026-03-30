# Design Spec: Resend Message (Tracking Copy)

Implement a secure and traceable "Resend Message" feature that allows users to copy a message from one conversation to another, while maintaining a reference to the original sender.

## 1. Goal
Provide a way for users to resend messages across conversations while preserving provenance (who originally sent it).

## 2. Changes

### 2.1 Database Schema
Update the `messages` table:
- `original_sender_id`: UUID, references `users(id)`, nullable.
- `is_resent`: BOOLEAN, default `false`.

### 2.2 Domain Layer
Update `Message` entity in `src/modules/chat/domain/message/message.ts`:
- Add `originalSenderId?: string`.
- Add `isResent: boolean`.
- Update `restore` and `createResent` static methods.

### 2.3 Application Layer
New Use Case: `ResendMessageUseCase`
- **Input**: `actorId`, `messageId`, `sourceConversationId`, `targetConversationId`.
- **Logic**:
    1. Validate `actorId` presence in both conversations.
    2. Validate `messageId` existence and ownership by `sourceConversationId`.
    3. Check `!message.getIsDeleted()`.
    4. Validate `actorId` permissions in `targetConversationId` (not muted/banned).
    5. Check user-to-user blocks if target is a direct chat.
    6. Create new message with:
        - `content` from original.
        - `senderId` = `actorId`.
        - `isResent = true`.
        - `originalSenderId = original.originalSenderId || original.senderId`.
    7. Save to repository.
    8. Update `last_message_at` for target conversation.
    9. Invalidate caches.

### 2.4 Transactional Service
New Service: `ResendMessageTxService`
- Wraps the use case in a database transaction.

### 2.5 API Layer
New Controller: `ResendMessageController` (HTTP POST)
- Route: `/private/conversation/:conversationId/messages/:messageId/resend`
- Body: `{ targetConversationId: string }`

## 3. Testing
- **Integration**: `MessageRepositoryPg` CRUD with new fields.
- **Unit**: `ResendMessageUseCase` permission and validation logic.
- **E2E**: `ResendMessageController` full flow.
