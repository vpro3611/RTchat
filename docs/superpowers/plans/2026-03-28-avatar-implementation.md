# Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure binary-based avatar system for users and groups using sharp for image processing and PostgreSQL for storage.

**Architecture:** Clean Architecture with DDD. A dedicated `avatars` table stores binary data (`BYTEA`), and `users`/`conversations` tables reference it via UUID. Image processing (stripping metadata, resizing, WebP conversion) is handled by `sharp` in the infrastructure layer.

**Tech Stack:** Node.js, TypeScript, Express, PostgreSQL, Multer, Sharp, Jest.

---

### Task 1: Dependencies and Database Schema

**Files:**
- Modify: `package.json`
- Create: `migrations/1774719762000_create-avatar-schema.ts`

- [ ] **Step 1: Add sharp and multer dependencies**
```bash
npm install sharp multer
npm install --save-dev @types/multer
```

- [ ] **Step 2: Create database migration**
Create `migrations/1774719762000_create-avatar-schema.ts`:
```typescript
import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("avatars", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        data: { type: "bytea", notNull: true },
        mime_type: { type: "varchar(50)", notNull: true },
        created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") }
    });

    pgm.addColumn("users", {
        avatar_id: { type: "uuid", references: "avatars", onDelete: "SET NULL" }
    });

    pgm.addColumn("conversations", {
        avatar_id: { type: "uuid", references: "avatars", onDelete: "SET NULL" }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("conversations", "avatar_id");
    pgm.dropColumn("users", "avatar_id");
    pgm.dropTable("avatars");
}
```

- [ ] **Step 3: Run migration**
```bash
npm run migrate up
```

- [ ] **Step 4: Commit**
```bash
git add package.json migrations/1774719762000_create-avatar-schema.ts
git commit -m "feat: add avatar schema and dependencies"
```

---

### Task 2: Domain Entity and Repository Interface

**Files:**
- Create: `src/modules/chat/domain/avatar/avatar.ts`
- Create: `src/modules/chat/domain/ports/avatar_repo_interface.ts`

- [ ] **Step 1: Create Avatar Domain Entity**
```typescript
export class Avatar {
    constructor(
        private readonly id: string | null,
        private readonly data: Buffer,
        private readonly mimeType: string,
        private readonly createdAt?: Date
    ) {}

    static create(data: Buffer, mimeType: string): Avatar {
        return new Avatar(null, data, mimeType);
    }

    static restore(id: string, data: Buffer, mimeType: string, createdAt: Date): Avatar {
        return new Avatar(id, data, mimeType, createdAt);
    }

    getId = () => this.id;
    getData = () => this.data;
    getMimeType = () => this.mimeType;
    getCreatedAt = () => this.createdAt;
}
```

- [ ] **Step 2: Define Avatar Repository Interface**
```typescript
import { Avatar } from "../avatar/avatar";

export interface AvatarRepoInterface {
    save(avatar: Avatar): Promise<string>;
    findById(id: string): Promise<Avatar | null>;
    delete(id: string): Promise<void>;
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/domain/avatar/avatar.ts src/modules/chat/domain/ports/avatar_repo_interface.ts
git commit -m "feat: add avatar domain entity and repo port"
```

---

### Task 3: Infrastructure - Image Processor and Repository

**Files:**
- Create: `src/modules/chat/infrasctructure/image_processor/sharp_image_processor.ts`
- Create: `src/modules/chat/repositories_pg_realization/avatar_repository_pg.ts`
- Test: `__tests__/chat/avatar/avatar_repository_pg.spec.ts`

- [ ] **Step 1: Implement Image Processor**
```typescript
import sharp from "sharp";

export class ImageProcessor {
    async processAvatar(buffer: Buffer): Promise<{ data: Buffer; mimeType: string }> {
        const processed = await sharp(buffer)
            .resize(500, 500, { fit: "cover", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        
        return { data: processed, mimeType: "image/webp" };
    }
}
```

- [ ] **Step 2: Implement Avatar Repository**
```typescript
import { Pool, PoolClient } from "pg";
import { Avatar } from "../domain/avatar/avatar";
import { AvatarRepoInterface } from "../domain/ports/avatar_repo_interface";
import { mapPgError } from "../../error_mapper/pg_error_mapper";

export class AvatarRepositoryPg implements AvatarRepoInterface {
    constructor(private readonly pool: Pool | PoolClient) {}

    async save(avatar: Avatar): Promise<string> {
        const query = "INSERT INTO avatars (data, mime_type) VALUES (, ) RETURNING id";
        try {
            const result = await this.pool.query(query, [avatar.getData(), avatar.getMimeType()]);
            return result.rows[0].id;
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findById(id: string): Promise<Avatar | null> {
        const query = "SELECT * FROM avatars WHERE id = ";
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            return Avatar.restore(row.id, row.data, row.mime_type, row.created_at);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async delete(id: string): Promise<void> {
        const query = "DELETE FROM avatars WHERE id = ";
        try {
            await this.pool.query(query, [id]);
        } catch (error) {
            throw mapPgError(error);
        }
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/infrasctructure/image_processor/sharp_image_processor.ts src/modules/chat/repositories_pg_realization/avatar_repository_pg.ts
git commit -m "feat: implement image processor and avatar repo"
```

---

### Task 4: User Avatar Use Cases

**Files:**
- Create: `src/modules/chat/application/avatar/set_user_avatar_use_case.ts`
- Create: `src/modules/chat/application/avatar/delete_user_avatar_use_case.ts`
- Modify: `src/modules/users/ports/user_repo_interfaces.ts` (add updateAvatarId)

- [ ] **Step 1: Add updateAvatarId to UserRepoWriter**
```typescript
// In src/modules/users/ports/user_repo_interfaces.ts
// Add to UserRepoWriter interface:
// updateAvatarId(userId: string, avatarId: string | null): Promise<void>;
```

- [ ] **Step 2: Implement SetUserAvatarUseCase**
```typescript
import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { UserRepoReader, UserRepoWriter } from "../../../users/ports/user_repo_interfaces";
import { Avatar } from "../../domain/avatar/avatar";
import { ImageProcessor } from "../../infrasctructure/image_processor/sharp_image_processor";

export class SetUserAvatarUseCase {
    constructor(
        private readonly userReader: UserRepoReader,
        private readonly userWriter: UserRepoWriter,
        private readonly avatarRepo: AvatarRepoInterface,
        private readonly imageProcessor: ImageProcessor
    ) {}

    async execute(userId: string, fileBuffer: Buffer): Promise<string> {
        const user = await this.userReader.getUserById(userId);
        if (!user) throw new Error("User not found");

        const oldAvatarId = user.getAvatarId(); // Assume getter exists or add it

        const { data, mimeType } = await this.imageProcessor.processAvatar(fileBuffer);
        const avatar = Avatar.create(data, mimeType);
        const newAvatarId = await this.avatarRepo.save(avatar);

        await this.userWriter.updateAvatarId(userId, newAvatarId);

        if (oldAvatarId) {
            await this.avatarRepo.delete(oldAvatarId);
        }

        return newAvatarId;
    }
}
```

- [ ] **Step 3: Commit**
```bash
git commit -m "feat: implement set user avatar use case"
```

---

### Task 5: Public Avatar Serving

**Files:**
- Create: `src/modules/chat/application/avatar/get_avatar_use_case.ts`
- Create: `src/modules/chat/controllers/avatar/get_avatar_controller.ts`

- [ ] **Step 1: Implement GetAvatarUseCase**
```typescript
import { AvatarRepoInterface } from "../../domain/ports/avatar_repo_interface";
import { Avatar } from "../../domain/avatar/avatar";

export class GetAvatarUseCase {
    constructor(private readonly avatarRepo: AvatarRepoInterface) {}

    async execute(avatarId: string): Promise<Avatar | null> {
        return await this.avatarRepo.findById(avatarId);
    }
}
```

- [ ] **Step 2: Implement GetAvatarController**
```typescript
import { Request, Response } from "express";
import { GetAvatarUseCase } from "../../application/avatar/get_avatar_use_case";

export class GetAvatarController {
    constructor(private readonly getAvatarUseCase: GetAvatarUseCase) {}

    async execute(req: Request, res: Response) {
        const { avatarId } = req.params;
        const avatar = await this.getAvatarUseCase.execute(avatarId);

        if (!avatar) {
            return res.status(404).send("Avatar not found");
        }

        res.setHeader("Content-Type", avatar.getMimeType());
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.status(200).send(avatar.getData());
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/application/avatar/get_avatar_use_case.ts src/modules/chat/controllers/avatar/get_avatar_controller.ts
git commit -m "feat: add public avatar serving"
```
