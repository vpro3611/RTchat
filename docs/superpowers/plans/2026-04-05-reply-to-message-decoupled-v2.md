# Decoupled Reply to Message (with Attachments) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Reply to Message" feature using a decoupled vertical slice, supporting text and media attachments (photos, videos, files).

**Architecture:** 
- **Database:** New `message_replies` table for linking messages.
- **Domain:** `Message` entity extended with `ReplyMetadata`.
- **Application:** `ReplyToMessageUseCase` handles validation, media processing (virus scan, stripping metadata, image resizing), and persistence.
- **Controllers:** New REST and Socket controllers for replies. REST endpoint supports `multipart/form-data`.

**Tech Stack:** TypeScript, Node.js, PostgreSQL, Vue 3, Quasar, Sharp (images), FFmpeg (video), ClamAV (virus scan).

---

### Task 1: Database and Domain Updates

**Files:**
- Create: `migrations/1775412000000_create-message-reply-schema.ts`
- Modify: `src/modules/chat/domain/message/message.ts`

- [ ] **Step 1: Create the migration file**

```typescript
import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("message_replies", {
        message_id: { type: "uuid", references: "messages(id)", onDelete: "CASCADE", primaryKey: true },
        parent_message_id: { type: "uuid", references: "messages(id)", onDelete: "SET NULL", notNull: true },
        parent_content_snippet: { type: "text", notNull: true },
        parent_sender_id: { type: "uuid", references: "users(id)", notNull: true },
        conversation_id: { type: "uuid", references: "conversations(id)", onDelete: "CASCADE", notNull: true },
        replied_by: { type: "uuid", references: "users(id)", onDelete: "CASCADE", notNull: true },
        replied_at: { type: "TIMESTAMPTZ", notNull: true, default: pgm.func('now()') }
    });
    pgm.createIndex("message_replies", ["parent_message_id"]);
    pgm.createIndex("message_replies", ["conversation_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("message_replies");
}
```

- [ ] **Step 2: Update the Message Domain Entity**

Add `ReplyMetadata` interface and update `Message` class (`constructor`, `restore`, `create`) to include optional `replyMetadata`.

---

### Task 2: Repository and Use Case Implementation

**Files:**
- Create: `src/modules/chat/repositories_pg_realization/message_reply_repository_pg.ts`
- Create: `src/modules/chat/application/message/reply_to_message_use_case.ts`
- Modify: `src/modules/chat/repositories_pg_realization/message_repository_pg.ts` (JOIN update)

- [ ] **Step 1: Implement MessageReplyRepositoryPg**

Handles insertion into `message_replies`.

- [ ] **Step 2: Update MessageRepositoryPg find methods**

Update `findById` and `findByConversationId` to `LEFT JOIN message_replies r ON messages.id = r.message_id` to retrieve reply context.

- [ ] **Step 3: Implement ReplyToMessageUseCase**

Logic:
1. Validate participant.
2. Fetch parent message.
3. Process attachments (using `virusScanner`, `imageProcessor`, `videoProcessor`, `blobRepo`).
4. Save message via `messageRepo`.
5. Save link via `messageReplyRepo`.

---

### Task 3: Service and Controllers (Rest & Socket)

**Files:**
- Create: `src/modules/chat/transactional_services/message/reply_to_message_service.ts`
- Create: `src/modules/chat/controllers/message/reply_to_message_rest_controller.ts`
- Create: `src/modules/chat/web_socket_controllers/message_controllers/reply_to_message_controller.ts`

- [ ] **Step 1: Implement ReplyToMessageTxService**

Transaction wrapper for the use case.

- [ ] **Step 2: Implement ReplyToMessageRestController**

Supports `upload.array('files', 10)` and extracts `parentMessageId` from body. Route: `POST /private/conversation/:conversationId/replies`.

- [ ] **Step 3: Implement ReplyToMessageSocketController**

Handles `message:reply` event (typically for text-only replies).

---

### Task 4: Wiring Up and Frontend Integration

**Files:**
- Modify: `src/app.ts`, `src/container.ts`, `src/modules/chat/web_socket/chat_gateway.ts`
- Modify: `frontend-chat/src/api/apis/message_api.ts`, `frontend-chat/src/services/chat_socket.ts`, `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Register routes and listeners**

- [ ] **Step 2: Update Frontend API**

Add `replyToMessage` and `replyToMessageWithFiles`.

- [ ] **Step 3: Update ChatPage UI**

Ensure `sendMessage` calls the correct reply endpoint when `replyingToMessage` is active.

- [ ] **Step 4: Verify full flow with attachments**

Test replying with an image/video and verifying the reply context renders correctly in the bubble.
