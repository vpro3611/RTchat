# Design Spec: Decoupled Reply to Message

**Date:** 2026-04-05  
**Topic:** Message Replies (Decoupled Implementation)  
**Status:** Draft

## 1. Overview
Implement the "Reply to Message" feature using a completely separate vertical slice (controller -> service -> repo) to ensure stability and avoid overlapping with the standard "Send Message" path.

## 2. Backend Components

### Repository: `MessageReplyRepositoryPg`
Manages the `message_replies` table.
- `create(replyData)`: Inserts a new link.
- `findByMessageId(messageId)`: Fetches link metadata.

### Use Case: `ReplyToMessageUseCase`
Handles the business logic for replying.
- Inputs: `actorId`, `conversationId`, `parentMessageId`, `content`.
- Dependencies: `MessageRepo`, `MessageReplyRepo`, `ConversationRepo`, `ParticipantRepo`, `UserToUserBansRepo`, `ConversationBansRepo`.
- logic:
    1. Fetch parent message.
    2. Validate it belongs to the conversation.
    3. Validate sender permissions.
    4. Create and save standard `Message` entity.
    5. Create and save `message_replies` entry using `MessageReplyRepo`.

### Controllers
- **REST:** `POST /private/conversation/:conversationId/replies`
- **Socket:** Event `message:reply` -> `ReplyToMessageSocketController`.

## 3. Data Model
Standard `messages` table remains the source of truth for the message itself.  
`message_replies` table stores the link and cached metadata (snippet, senderId).

## 4. Frontend Integration
### API Service
`MessageApi.replyToMessage(conversationId, parentMessageId, content)` -> calls the new REST endpoint.

### Socket Service
`chatSocket.replyToMessage(conversationId, parentMessageId, content)` -> emits the new `message:reply` event.

### UI
Render logic remains the same as previously designed (reply block in bubble, preview in input).

## 5. Verification Strategy
- **Unit Tests:** `ReplyToMessageUseCase` validates all edge cases (parent not found, wrong conversation).
- **Integration Tests:** `MessageReplyRepositoryPg` correctly saves and retrieves links.
- **E2E Tests:** Sending a reply via REST and Socket separately.
