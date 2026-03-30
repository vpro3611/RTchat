# Resend Message Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure "Resend Message" feature allowing users to copy messages across conversations while preserving the original sender's identity.

**Architecture:** Clean Architecture with DDD. Updates to Domain (Message entity), Data (Repository/DTO/Mapper), and API (Controller/Routes) layers.

**Tech Stack:** Node.js, TypeScript, Express, PostgreSQL, Socket.io, Zod.

---

### Task 1: Update Domain Entity

**Files:**
- Modify: `src/modules/chat/domain/message/message.ts`

- [ ] **Step 1: Add new fields and update constructor**

```typescript
export class Message {
    constructor(
        public readonly id: string,
        private readonly conversationId: string,
        private readonly senderId: string,
        private content: Content,
        private isEdited: boolean,
        private isDeleted: boolean,
        private readonly createdAt: Date,
        private updatedAt: Date,
        private readonly originalSenderId?: string,
        private readonly isResent: boolean = false,
    ) {}
    
    // ... getters
    getOriginalSenderId = () => this.originalSenderId;
    getIsResent = () => this.isResent;
}
```

- [ ] **Step 2: Update `restore` method**

```typescript
    static restore(
        id: string,
        conversationId: string,
        senderId: string,
        content: string,
        isEdited: boolean,
        isDeleted: boolean,
        createdAt: Date,
        updatedAt: Date,
        originalSenderId?: string,
        isResent: boolean = false,
    ) {
        return new Message(
            id,
            conversationId,
            senderId,
            Content.create(content),
            isEdited,
            isDeleted,
            createdAt,
            updatedAt,
            originalSenderId,
            isResent,
        );
    }
```

- [ ] **Step 3: Add `createResent` method**

```typescript
    static createResent(
        targetConversationId: string,
        actorId: string,
        content: Content,
        originalSenderId: string
    ) {
        return new Message(
            crypto.randomUUID(),
            targetConversationId,
            actorId,
            content,
            false,
            false,
            new Date(),
            new Date(),
            originalSenderId,
            true
        );
    }
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/chat/domain/message/message.ts
git commit -m "domain: add resend support to Message entity"
```

---

### Task 2: Update DTO and Mapper

**Files:**
- Modify: `src/modules/chat/DTO/message_dto.ts`
- Modify: `src/modules/chat/shared/map_to_message.ts`

- [ ] **Step 1: Update `MessageDTO`**

```typescript
export type MessageDTO = {
    // ... existing
    originalSenderId?: string,
    isResent: boolean,
}
```

- [ ] **Step 2: Update `MapToMessage`**

```typescript
export class MapToMessage {
    mapToMessage(message: Message): MessageDTO {
        return {
            // ... existing
            originalSenderId: message.getOriginalSenderId(),
            isResent: message.getIsResent(),
        }
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/chat/DTO/message_dto.ts src/modules/chat/shared/map_to_message.ts
git commit -m "chat: update MessageDTO and mapper for resend fields"
```

---

### Task 3: Update Repository

**Files:**
- Modify: `src/modules/chat/repositories_pg_realization/message_repository_pg.ts`

- [ ] **Step 1: Update `mapToMessage`**

```typescript
    private mapToMessage(row: any): Message {
        return Message.restore(
            row.id,
            row.conversation_id,
            row.sender_id,
            row.content,
            row.is_edited,
            row.is_deleted,
            row.created_at,
            row.updated_at,
            row.original_sender_id,
            row.is_resent,
        );
    }
```

- [ ] **Step 2: Update `create` method**

```typescript
    async create(message: Message): Promise<void> {
        try {
            await this.pg.query(
                `
                    INSERT INTO messages
                    (id, conversation_id, sender_id, content, is_edited, is_deleted, created_at, updated_at, original_sender_id, is_resent)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `,
                [
                    // ... existing
                    message.getOriginalSenderId(),
                    message.getIsResent(),
                ]
            );
        } catch (error) {
            throw mapPgError(error);
        }
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/chat/repositories_pg_realization/message_repository_pg.ts
git commit -m "chat: update MessageRepositoryPg to support resend fields"
```

---

### Task 4: Unit Test for Use Case

**Files:**
- Create: `__tests__/chat/application/resend_message_use_case.spec.ts`

- [ ] **Step 1: Write unit tests for `ResendMessageUseCase`**

(Mock dependencies, test normal flow, deleted message error, permission error, blocking relations).

- [ ] **Step 2: Run tests**

Run: `npm test __tests__/chat/application/resend_message_use_case.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __tests__/chat/application/resend_message_use_case.spec.ts
git commit -m "test: add unit tests for ResendMessageUseCase"
```

---

### Task 5: Register in DI Container

**Files:**
- Modify: `src/container.ts`

- [ ] **Step 1: Instantiate service and controller**

```typescript
    // TODO : CHAT (SERVICES)
    const resendMessageService = new ResendMessageTxService(txManager, RedisCacheService);

    // TODO : HTTP CONTROLLERS
    const resendMessageController = new ResendMessageController(
        resendMessageService,
        extractActorId,
        io
    );
```

- [ ] **Step 2: Add to return object**

```typescript
    return {
        // ...
        resendMessageController,
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/container.ts
git commit -m "chat: register ResendMessage service and controller in DI container"
```

---

### Task 6: Add Route to Express App

**Files:**
- Modify: `src/app.ts`

- [ ] **Step 1: Add resend route**

```typescript
    privateRouter.post("/conversation/:conversationId/messages/:messageId/resend",
        validateParams(ResendMessageParamsSchema),
        validateBody(ResendMessageBodySchema),
        dependencies.resendMessageController.resendMessageCont
    );
```

- [ ] **Step 2: Commit**

```bash
git add src/app.ts
git commit -m "chat: add resend message route to Express app"
```

---

### Task 7: E2E Verification

**Files:**
- Modify/Create: `__tests__/chat/integration/resend_message_e2e.spec.ts`

- [ ] **Step 1: Write E2E test**

(Send message in Conv A, resend to Conv B, verify Conv B has message with `isResent: true` and `originalSenderId` matching original sender).

- [ ] **Step 2: Run E2E tests**

Run: `npm test __tests__/chat/integration/resend_message_e2e.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __tests__/chat/integration/resend_message_e2e.spec.ts
git commit -m "test: add E2E tests for Resend Message feature"
```
