# Attachment Domain Entity and Message Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `Attachment` domain entity and update the `Message` entity to support optional attachments.

**Architecture:** The `Attachment` entity represents a file attached to a message. The `Message` entity is updated to hold an optional list of `Attachment` objects, following the existing domain model patterns (restore, create, createResent).

**Tech Stack:** TypeScript, Node.js (crypto for UUIDs).

---

### Task 1: Create Attachment Entity

**Files:**
- Create: `src/modules/chat/domain/message/attachment.ts`

- [ ] **Step 1: Create the Attachment class**

```typescript
export type AttachmentType = 'image' | 'video' | 'file';

export class Attachment {
    constructor(
        public readonly id: string,
        public readonly blobId: string,
        public readonly type: AttachmentType,
        public readonly name: string,
        public readonly mimeType: string,
        public readonly size: number,
        public readonly createdAt: Date = new Date()
    ) {}

    static restore(id: string, blobId: string, type: AttachmentType, name: string, mimeType: string, size: number, createdAt: Date) {
        return new Attachment(id, blobId, type, name, mimeType, size, createdAt);
    }

    static create(blobId: string, type: AttachmentType, name: string, mimeType: string, size: number) {
        return new Attachment(crypto.randomUUID(), blobId, type, name, mimeType, size);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/chat/domain/message/attachment.ts
git commit -m "feat(chat): add Attachment domain entity"
```

---

### Task 2: Update Message Entity

**Files:**
- Modify: `src/modules/chat/domain/message/message.ts`

- [ ] **Step 1: Import Attachment and update Message class**

Update imports and add `attachments` to constructor and methods.

```typescript
import {Content} from "./content";
import {CannotEditMessageError} from "../../errors/message_errors/message_errors";
import {Attachment} from "./attachment"; // Add this

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
        private readonly attachments: Attachment[] = [] // Add this
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
        attachments: Attachment[] = [] // Add this
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
            attachments // Add this
        );
    }

    static create(
        conversationId: string,
        senderId: string,
        content: Content,
        attachments: Attachment[] = [] // Add this
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
            undefined, // Add this for consistency with constructor
            false,     // Add this for consistency with constructor
            attachments // Add this
        );
    }

    static createResent(
        targetConversationId: string,
        actorId: string,
        content: Content,
        originalSenderId: string,
        attachments: Attachment[] = [] // Add this
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
            true,
            attachments // Add this
        );
    }
    
    // ... existing methods ...

    getAttachments = () => this.attachments; // Add this
    
    // ... existing getters ...
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/chat/domain/message/message.ts
git commit -m "feat(chat): update Message entity to support attachments"
```

---

### Task 3: Verify with Unit Tests

**Files:**
- Create: `__tests__/chat/message/domain/attachment_domain.spec.ts`
- Modify: `__tests__/chat/message/domain/message_domain.spec.ts`

- [ ] **Step 1: Create Attachment unit tests**

```typescript
import { Attachment } from "../../../../src/modules/chat/domain/message/attachment";

describe("Attachment Domain", () => {
    it("should create attachment", () => {
        const attachment = Attachment.create(
            "blob-1",
            "image",
            "test.png",
            "image/png",
            1024
        );

        expect(attachment.id).toBeDefined();
        expect(attachment.blobId).toBe("blob-1");
        expect(attachment.type).toBe("image");
        expect(attachment.name).toBe("test.png");
        expect(attachment.mimeType).toBe("image/png");
        expect(attachment.size).toBe(1024);
        expect(attachment.createdAt).toBeInstanceOf(Date);
    });

    it("should restore attachment", () => {
        const now = new Date();
        const attachment = Attachment.restore(
            "att-1",
            "blob-1",
            "video",
            "movie.mp4",
            "video/mp4",
            2048,
            now
        );

        expect(attachment.id).toBe("att-1");
        expect(attachment.blobId).toBe("blob-1");
        expect(attachment.type).toBe("video");
        expect(attachment.name).toBe("movie.mp4");
        expect(attachment.mimeType).toBe("video/mp4");
        expect(attachment.size).toBe(2048);
        expect(attachment.createdAt).toBe(now);
    });
});
```

- [ ] **Step 2: Add Attachment tests to Message unit tests**

Add a test case in `__tests__/chat/message/domain/message_domain.spec.ts` to verify attachments in `Message`.

```typescript
    it("should create message with attachments", () => {
        const content = Content.create("Hello with files");
        const attachment = Attachment.create("blob-1", "image", "test.png", "image/png", 1024);

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            content,
            [attachment]
        );

        expect(message.getAttachments()).toHaveLength(1);
        expect(message.getAttachments()[0]).toBe(attachment);
    });
```

- [ ] **Step 3: Run tests**

Run: `npm test __tests__/chat/message/domain/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add __tests__/chat/message/domain/
git commit -m "test(chat): add tests for attachments in Message domain"
```
