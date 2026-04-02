# Message Attachments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the ability to send multiple attachments (photos, videos, files) within messages with secure processing (virus scanning, transcoding, metadata stripping) and hybrid database storage.

**Architecture:** Hybrid Metadata/Blob schema in PostgreSQL. Attachments are processed via a pipeline (ClamAV for scanning, Sharp for images, FFmpeg for videos) before being stored as `bytea`.

**Tech Stack:** Node.js, TypeScript, PostgreSQL (node-pg-migrate), Sharp, FFmpeg, ClamAV.

---

### Task 1: Database Migrations

**Files:**
- Create: `migrations/1774820000000_create_attachments_tables.ts`

- [ ] **Step 1: Write migration for attachment tables**
```typescript
import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("attachment_blobs", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        data: { type: "bytea", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func('now()') },
    });

    pgm.createTable("message_attachments", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        message_id: { type: "uuid", notNull: true, references: "messages(id)", onDelete: "CASCADE" },
        blob_id: { type: "uuid", notNull: true, references: "attachment_blobs(id)" },
        type: { type: "varchar(20)", notNull: true }, // 'image', 'video', 'file'
        name: { type: "text", notNull: true },
        mime_type: { type: "varchar(100)", notNull: true },
        size: { type: "integer", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func('now()') },
    });

    pgm.createIndex("message_attachments", ["message_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("message_attachments");
    pgm.dropTable("attachment_blobs");
}
```

- [ ] **Step 2: Run migration**
Run: `npm run migrate up`
Expected: Successfully applied 1 migration.

- [ ] **Step 3: Commit**
```bash
git add migrations/1774820000000_create_attachments_tables.ts
git commit -m "chore: add attachment tables migration"
```

---

### Task 2: Attachment Domain Entity and Message Update

**Files:**
- Create: `src/modules/chat/domain/message/attachment.ts`
- Modify: `src/modules/chat/domain/message/message.ts`

- [ ] **Step 1: Create Attachment entity**
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

- [ ] **Step 2: Update Message entity**
Modify `src/modules/chat/domain/message/message.ts` to include attachments.
```typescript
import { Attachment } from "./attachment";

export class Message {
    constructor(
        // ... existing
        private readonly attachments: Attachment[] = [],
    ) {}

    static restore(
        // ... existing
        attachments: Attachment[] = [],
    ) {
        return new Message(
            // ... existing
            attachments,
        );
    }
    
    // Add create/createResent updates too
    
    getAttachments = () => this.attachments;
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/domain/message/attachment.ts src/modules/chat/domain/message/message.ts
git commit -m "feat: add Attachment entity and update Message domain"
```

---

### Task 3: Infrastructure - Processors and Scanner

**Files:**
- Create: `src/modules/chat/domain/ports/virus_scanner_interface.ts`
- Create: `src/modules/chat/domain/ports/video_processor_interface.ts`
- Create: `src/modules/chat/infrasctructure/virus_scanner/clamav_scanner.ts`
- Create: `src/modules/chat/infrasctructure/video_processor/ffmpeg_processor.ts`

- [ ] **Step 1: Implement ClamAV Scanner**
```typescript
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export class ClamAVScanner {
    async scanBuffer(buffer: Buffer): Promise<boolean> {
        const tempPath = path.join("/tmp", `scan_${Date.now()}.tmp`);
        await fs.writeFile(tempPath, buffer);
        try {
            await execAsync(`clamscan ${tempPath}`);
            return true;
        } catch (error) {
            return false;
        } finally {
            await fs.unlink(tempPath).catch(() => {});
        }
    }
}
```

- [ ] **Step 2: Implement FFmpeg Video Processor**
```typescript
import ffmpeg from "fluent-ffmpeg";
import { Readable, Writable } from "stream";

export class VideoProcessor {
    async stripMetadata(buffer: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const inputStream = new Readable();
            inputStream.push(buffer);
            inputStream.push(null);

            const chunks: Buffer[] = [];
            const outputStream = new Writable({
                write(chunk, encoding, callback) {
                    chunks.push(chunk);
                    callback();
                }
            });

            ffmpeg(inputStream)
                .outputOptions("-map_metadata -1")
                .toFormat("mp4")
                .on("error", reject)
                .on("end", () => resolve(Buffer.concat(chunks)))
                .pipe(outputStream);
        });
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/infrasctructure/virus_scanner/clamav_scanner.ts src/modules/chat/infrasctructure/video_processor/ffmpeg_processor.ts
git commit -m "feat: implement ClamAV scanner and FFmpeg processor"
```

---

### Task 4: Repositories (Metadata & Blobs)

**Files:**
- Create: `src/modules/chat/repositories_pg_realization/attachment_repository_pg.ts`
- Create: `src/modules/chat/repositories_pg_realization/blob_repository_pg.ts`

- [ ] **Step 1: Implement Blob Repository**
```typescript
import { Pool, PoolClient } from "pg";

export class BlobRepositoryPg {
    constructor(private readonly pool: Pool | PoolClient) {}

    async save(buffer: Buffer): Promise<string> {
        const result = await this.pool.query(
            "INSERT INTO attachment_blobs (data) VALUES ($1) RETURNING id",
            [buffer]
        );
        return result.rows[0].id;
    }
}
```

- [ ] **Step 2: Implement Attachment Repository**
```typescript
import { Pool, PoolClient } from "pg";
import { Attachment, AttachmentType } from "../domain/message/attachment";

export class AttachmentRepositoryPg {
    constructor(private readonly pool: Pool | PoolClient) {}

    async save(messageId: string, attachment: Attachment): Promise<void> {
        await this.pool.query(
            "INSERT INTO message_attachments (id, message_id, blob_id, type, name, mime_type, size, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [attachment.id, messageId, attachment.blobId, attachment.type, attachment.name, attachment.mimeType, attachment.size, attachment.createdAt]
        );
    }

    async findByMessageId(messageId: string): Promise<Attachment[]> {
        const result = await this.pool.query(
            "SELECT * FROM message_attachments WHERE message_id = $1",
            [messageId]
        );
        return result.rows.map(row => Attachment.restore(row.id, row.blob_id, row.type as AttachmentType, row.name, row.mime_type, row.size, row.created_at));
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/repositories_pg_realization/attachment_repository_pg.ts src/modules/chat/repositories_pg_realization/blob_repository_pg.ts
git commit -m "feat: implement Attachment and Blob repositories"
```

---

### Task 5: Use Case and Controller Integration

**Files:**
- Modify: `src/modules/chat/application/send_message_use_case.ts`
- Modify: `src/modules/chat/controllers/message_controller.ts`

- [ ] **Step 1: Integrate processing and storage into SendMessageUseCase**
Update the use case to accept files, scan them, process them, and save them within the database transaction.

- [ ] **Step 2: Update MessageController to handle multipart/form-data**
Configure `multer` and update the controller to pass files to the use case.

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/application/send_message_use_case.ts src/modules/chat/controllers/message_controller.ts
git commit -m "feat: integrate attachments into send message flow"
```
