# Decoupled Reply to Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Reply to Message" feature using a completely separate vertical slice (controller -> service -> repo) to ensure stability and isolation from the standard message path.

**Architecture:** Create a new `MessageReplyRepositoryPg` for the `message_replies` table and a `ReplyToMessageUseCase` to coordinate fetching parents and saving replies. New REST and Socket controllers will expose this functionality.

**Tech Stack:** TypeScript, Node.js, PostgreSQL, Vue 3, Quasar, Socket.io.

---

### Task 1: Backend Repository and Use Case

**Files:**
- Create: `src/modules/chat/repositories_pg_realization/message_reply_repository_pg.ts`
- Create: `src/modules/chat/application/message/reply_to_message_use_case.ts`
- Test: `__tests__/chat/message/application/reply_to_message_use_case.spec.ts`

- [ ] **Step 1: Implement MessageReplyRepositoryPg**

```typescript
import {Pool, PoolClient} from "pg";
import {ReplyMetadata} from "../domain/message/message";

export class MessageReplyRepositoryPg {
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
```

- [ ] **Step 2: Implement ReplyToMessageUseCase**

Implement logic to:
1. Fetch parent message from `messageRepo`.
2. Validate conversation ID match.
3. Validate sender permissions (using `checkIsParticipant`, `userToUserBansRepo`, etc.).
4. Create new `Message` entity.
5. Save via `messageRepo`.
6. Save link via `messageReplyRepo`.

- [ ] **Step 3: Write and run tests for the Use Case**

---

### Task 2: Backend Service and Controllers

**Files:**
- Create: `src/modules/chat/transactional_services/message/reply_to_message_service.ts`
- Create: `src/modules/chat/controllers/message/reply_to_message_rest_controller.ts`
- Create: `src/modules/chat/web_socket_controllers/message_controllers/reply_to_message_controller.ts`

- [ ] **Step 1: Implement ReplyToMessageTxService**

Wraps the UseCase in a transaction using `txManager`.

- [ ] **Step 2: Implement ReplyToMessageRestController**

Exposes `POST /private/conversation/:conversationId/replies`.

- [ ] **Step 3: Implement ReplyToMessageSocketController**

Handles `message:reply` event and emits `message:new` to the room.

---

### Task 3: Wiring Up (Container & Gateway)

**Files:**
- Modify: `src/container.ts`
- Modify: `src/app.ts`
- Modify: `src/modules/chat/web_socket/chat_gateway.ts`

- [ ] **Step 1: Update container.ts**

Instantiate `MessageReplyRepositoryPg`, `ReplyToMessageUseCase`, `ReplyToMessageTxService`, and both controllers.

- [ ] **Step 2: Update app.ts**

Register the REST route: `privateRouter.post("/conversation/:conversationId/replies", ...)`

- [ ] **Step 3: Update chat_gateway.ts**

Register the socket listener for `message:reply`.

---

### Task 4: Frontend Integration

**Files:**
- Modify: `frontend-chat/src/api/apis/message_api.ts`
- Modify: `frontend-chat/src/services/chat_socket.ts`
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Update MessageApi**

Add `replyToMessage(conversationId, content, parentMessageId)` using the new endpoint.

- [ ] **Step 2: Update chatSocket**

Add `replyToMessage(conversationId, content, parentMessageId)` emitting `message:reply`.

- [ ] **Step 3: Update ChatPage.vue**

Update `sendMessage()` to call `replyToMessage` if `replyingToMessage` is set, otherwise call standard send.

- [ ] **Step 4: Verify full flow**

Test sending replies via REST (if files present) and Socket (if text only).
