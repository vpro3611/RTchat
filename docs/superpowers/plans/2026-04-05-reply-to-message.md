# Reply to Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the ability to reply to a specific message, storing the relationship in a `message_replies` table with a cached snippet of the parent message.

**Architecture:** Use a separate link table `message_replies` to store the parent-child relationship and metadata (snippet, sender ID). The `Message` domain entity will be updated to include optional `ReplyMetadata`. The repository will use a `LEFT JOIN` to fetch this metadata efficiently.

**Tech Stack:** TypeScript, Node.js, PostgreSQL (node-pg-migrate), Jest.

---

### Task 1: Update Database Schema

**Files:**
- Modify: `migrations/1775404985579_create-message-reply-schema.ts`

- [ ] **Step 1: Update the migration file**

```typescript
import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("message_replies", {
        message_id: {
            type: "uuid",
            references: "messages(id)",
            onDelete: "CASCADE",
            primaryKey: true,
        },
        parent_message_id: {
            type: "uuid",
            references: "messages(id)",
            onDelete: "SET NULL", // Keep the reply even if parent is deleted
            notNull: true,
        },
        parent_content_snippet: {
            type: "text",
            notNull: true,
        },
        parent_sender_id: {
            type: "uuid",
            references: "users(id)",
            notNull: true,
        },
        conversation_id: {
            type: "uuid",
            references: "conversations(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
        replied_by: {
            type: "uuid",
            references: "users(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
        replied_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        }
    });
    
    pgm.createIndex("message_replies", ["parent_message_id"]);
    pgm.createIndex("message_replies", ["conversation_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("message_replies");
}
```

- [ ] **Step 2: Run the migration**

Run: `npm run migrate up` (or equivalent command for the project)
Expected: Migration executes successfully.

- [ ] **Step 3: Commit**

```bash
git add migrations/1775404985579_create-message-reply-schema.ts
git commit -m "db: update message_replies schema with parent metadata"
```

---

### Task 2: Update Domain Entity

**Files:**
- Modify: `src/modules/chat/domain/message/message.ts`
- Test: `__tests__/chat/message/domain/message.spec.ts` (create if doesn't exist)

- [ ] **Step 1: Write a failing test for Message with ReplyMetadata**

```typescript
import { Message, ReplyMetadata } from "../../../../src/modules/chat/domain/message/message";
import { Content } from "../../../../src/modules/chat/domain/message/content";

describe('Message Domain Entity', () => {
    it('should allow creating a message with reply metadata', () => {
        const replyMetadata: ReplyMetadata = {
            parentMessageId: 'parent-id',
            parentContentSnippet: 'Hello world',
            parentSenderId: 'sender-id'
        };
        const message = Message.create(
            'conv-id',
            'user-id',
            Content.create('My reply'),
            [],
            replyMetadata
        );
        expect(message.getReplyMetadata()).toEqual(replyMetadata);
    });
});
```

- [ ] **Step 2: Update the Message class**

```typescript
export interface ReplyMetadata {
    parentMessageId: string;
    parentContentSnippet: string;
    parentSenderId: string;
}

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
        private readonly attachments: Attachment[] = [],
        private readonly replyMetadata?: ReplyMetadata // Add this
    ) {}

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
        attachments: Attachment[] = [],
        replyMetadata?: ReplyMetadata // Add this
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
            attachments,
            replyMetadata // Pass this
        );
    }

    static create(
        conversationId: string,
        senderId: string,
        content: Content,
        attachments: Attachment[] = [],
        replyMetadata?: ReplyMetadata // Add this
    ) {
        return new Message(
            crypto.randomUUID(),
            conversationId,
            senderId,
            content,
            false,
            false,
            new Date(),
            new Date(),
            undefined,
            false,
            attachments,
            replyMetadata // Pass this
        );
    }
    
    // ... existing methods
    
    getReplyMetadata = () => this.replyMetadata;
}
```

- [ ] **Step 3: Run tests and verify PASS**

Run: `npm test __tests__/chat/message/domain/message.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/modules/chat/domain/message/message.ts
git commit -m "feat(domain): add ReplyMetadata to Message entity"
```

---

### Task 3: Update Repository Interface and Implementation

**Files:**
- Modify: `src/modules/chat/domain/ports/message_repo_interface.ts`
- Modify: `src/modules/chat/repositories_pg_realization/message_repository_pg.ts`
- Test: `__tests__/chat/message/integration/message_repository_pg.spec.ts`

- [ ] **Step 1: Update MessageRepoInterface**

```typescript
export interface MessageRepoInterface {
    create(message: Message): Promise<void>;
    update(message: Message): Promise<void>;
    findByConversationId(conversationId: string, limit?: number, cursor?: string): Promise<{items: Message[], nextCursor?: string}>;
    findById(id: string): Promise<Message | null>;
}
```
*(No change to signature needed, but we ensure implementation handles metadata)*

- [ ] **Step 2: Update MessageRepositoryPg.mapToMessage**

```typescript
    private mapToMessage(row: any, attachments: any[] = []): Message {
        const decryptedContent = this.encryptionService.decrypt(row.content);
        
        let replyMetadata: ReplyMetadata | undefined;
        if (row.parent_message_id) {
            replyMetadata = {
                parentMessageId: row.parent_message_id,
                parentContentSnippet: row.parent_content_snippet,
                parentSenderId: row.parent_sender_id
            };
        }

        return Message.restore(
            row.id,
            row.conversation_id,
            row.sender_id,
            decryptedContent,
            row.is_edited,
            row.is_deleted,
            row.created_at,
            row.updated_at,
            row.original_sender_id,
            row.is_resent,
            attachments,
            replyMetadata // Pass to restore
        );
    }
```

- [ ] **Step 3: Update MessageRepositoryPg.create to handle replies**

```typescript
    async create(message: Message): Promise<void> {
        try {
            const encryptedContent = this.encryptionService.encrypt(message.getContent().getContentValue());
            
            // Start transaction if possible, or just sequential queries
            await this.pg.query(
                `INSERT INTO messages (...) VALUES (...)`,
                [...]
            );

            const replyMetadata = message.getReplyMetadata();
            if (replyMetadata) {
                await this.pg.query(
                    `
                    INSERT INTO message_replies
                    (message_id, parent_message_id, parent_content_snippet, parent_sender_id, conversation_id, replied_by)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    `,
                    [
                        message.id,
                        replyMetadata.parentMessageId,
                        replyMetadata.parentContentSnippet,
                        replyMetadata.parentSenderId,
                        message.getConversationId(),
                        message.getSenderId()
                    ]
                );
            }

            for (const attachment of message.getAttachments()) {
                await this.attachmentRepo.save(message.id, attachment);
            }
        } catch (error) {
            throw mapPgError(error);
        }
    }
```

- [ ] **Step 4: Update MessageRepositoryPg find methods with JOIN**

```typescript
    async findById(id: string): Promise<Message | null> {
        const result = await this.pg.query(`
            SELECT m.*, r.parent_message_id, r.parent_content_snippet, r.parent_sender_id
            FROM messages m
            LEFT JOIN message_replies r ON m.id = r.message_id
            WHERE m.id = $1`,
            [id]);
        // ... rest of logic
    }
    
    // Apply same JOIN to findByConversationId
```

- [ ] **Step 5: Run integration tests**

Run: `npm test __tests__/chat/message/integration/message_repository_pg.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/chat/repositories_pg_realization/message_repository_pg.ts
git commit -m "feat(infra): implement message replies in PostgreSQL repository"
```

---

### Task 4: Update SendMessageUseCase

**Files:**
- Modify: `src/modules/chat/application/message/send_message_use_case.ts`
- Test: `__tests__/chat/message/application/send_message_use_case.spec.ts`

- [ ] **Step 1: Write a failing test for replying to a message**

```typescript
// Add test case to existing spec
it('should create a message as a reply when parentMessageId is provided', async () => {
    // ... mock parent message fetch
    // ... call sendMessageUseCase with parentMessageId
    // ... verify messageRepo.create was called with ReplyMetadata
});
```

- [ ] **Step 2: Update sendMessageUseCase signature and logic**

```typescript
    async sendMessageUseCase(
        actorId: string, 
        conversationId: string, 
        content: string, 
        files: FileDTO[] = [],
        parentMessageId?: string // Add this
    ): Promise<MessageDTO> {
        // ... existing validation
        
        let replyMetadata: ReplyMetadata | undefined;
        if (parentMessageId) {
            const parentMessage = await this.messageRepo.findById(parentMessageId);
            if (!parentMessage) {
                throw new Error("Parent message not found"); // Use appropriate error
            }
            if (parentMessage.getConversationId() !== conversationId) {
                throw new Error("Cannot reply to a message from a different conversation");
            }
            
            replyMetadata = {
                parentMessageId: parentMessage.id,
                parentContentSnippet: parentMessage.getContent().getContentValue().substring(0, 100),
                parentSenderId: parentMessage.getSenderId()
            };
        }

        const message = Message.create(
            conversationId,
            actorId,
            validatedContent,
            attachments,
            replyMetadata // Pass to create
        );
        
        // ... rest of logic
    }
```

- [ ] **Step 3: Run tests and verify PASS**

Run: `npm test __tests__/chat/message/application/send_message_use_case.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/modules/chat/application/message/send_message_use_case.ts
git commit -m "feat(app): handle parentMessageId in SendMessageUseCase"
```

---

### Task 5: Update DTO and Mapper

**Files:**
- Modify: `src/modules/chat/DTO/message_dto.ts`
- Modify: `src/modules/chat/shared/map_to_message.ts`

- [ ] **Step 1: Update MessageDTO**

```typescript
export interface MessageDTO {
    id: string;
    // ... existing fields
    replyTo?: {
        id: string;
        snippet: string;
        senderId: string;
    };
}
```

- [ ] **Step 2: Update MapToMessage mapper**

```typescript
    mapToMessage(message: Message, maxReadAt?: Date): MessageDTO {
        const replyMetadata = message.getReplyMetadata();
        return {
            id: message.id,
            // ... existing mapping
            replyTo: replyMetadata ? {
                id: replyMetadata.parentMessageId,
                snippet: replyMetadata.parentContentSnippet,
                senderId: replyMetadata.parentSenderId
            } : undefined
        };
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/chat/DTO/message_dto.ts src/modules/chat/shared/map_to_message.ts
git commit -m "feat(dto): include replyTo in MessageDTO"
```
