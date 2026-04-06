# Voice Message Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement recording and sending voice messages, including support for forwarding (resending) and replying.

**Architecture:** Extend the existing attachment system. Standardize audio on OGG/Opus. Fix ResendMessageUseCase to copy attachments.

**Tech Stack:** Node.js, TypeScript, PostgreSQL, fluent-ffmpeg, ffprobe.

---

## File Mapping
- **Domain:** `src/modules/chat/domain/message/attachment.ts`
- **DTO:** `src/modules/chat/DTO/attachment_dto.ts`
- **Infrastructure:** `src/modules/chat/domain/ports/audio_processor_interface.ts`, `src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts`
- **Use Cases:** `src/modules/chat/application/message/send_message_use_case.ts`, `src/modules/chat/application/message/reply_to_message_use_case.ts`, `src/modules/chat/application/message/resend_message_use_case.ts`
- **Repository:** `src/modules/chat/repositories_pg_realization/attachment_repository_pg.ts`
- **DI:** `src/container.ts`

---

### Task 1: Database Migration

**Files:**
- Create: `migrations/1775412000001_add-duration-to-attachments.ts`

- [ ] **Step 1: Create migration file**
```typescript
import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn("message_attachments", {
        duration: { type: "integer", notNull: false }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("message_attachments", "duration");
}
```

- [ ] **Step 2: Run migration**
Run: `npm run migrate`

- [ ] **Step 3: Commit**
```bash
git add migrations/1775412000001_add-duration-to-attachments.ts
git commit -m "feat: add duration column to message_attachments"
```

### Task 2: Domain and DTO Updates

**Files:**
- Modify: `src/modules/chat/domain/message/attachment.ts`
- Modify: `src/modules/chat/DTO/attachment_dto.ts`
- Modify: `src/modules/chat/shared/map_to_message.ts`

- [ ] **Step 1: Update AttachmentType and Attachment class**
Add `'voice'` to `AttachmentType`. Add `duration` property to `Attachment` class, `create`, and `restore` methods.

- [ ] **Step 2: Update AttachmentDTO**
Add `duration?: number` to `AttachmentDTO` type.

- [ ] **Step 3: Update MapToMessage**
Update the mapping logic to include `duration` in the returned DTO.

- [ ] **Step 4: Commit**
```bash
git add src/modules/chat/domain/message/attachment.ts src/modules/chat/DTO/attachment_dto.ts src/modules/chat/shared/map_to_message.ts
git commit -m "domain: update attachment to support voice and duration"
```

### Task 3: Audio Processor Infrastructure

**Files:**
- Create: `src/modules/chat/domain/ports/audio_processor_interface.ts`
- Create: `src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts`

- [ ] **Step 1: Define AudioProcessorInterface**
```typescript
export interface AudioProcessorInterface {
    processAudio(buffer: Buffer): Promise<{ data: Buffer; duration: number; mimeType: string }>;
}
```

- [ ] **Step 2: Implement FfmpegAudioProcessor**
Implement `processAudio` using `fluent-ffmpeg` to convert to OGG/Opus and `ffprobe` to extract duration.

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/domain/ports/audio_processor_interface.ts src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts
git commit -m "infra: implement FFmpeg audio processor for OGG/Opus"
```

### Task 4: Repository Updates

**Files:**
- Modify: `src/modules/chat/repositories_pg_realization/attachment_repository_pg.ts`

- [ ] **Step 1: Update save method**
Ensure `duration` is saved to the database.

- [ ] **Step 2: Update find methods**
Ensure `duration` is retrieved and passed to `Attachment.restore`.

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/repositories_pg_realization/attachment_repository_pg.ts
git commit -m "repo: update attachment repository to handle duration"
```

### Task 5: Use Case Implementation (Send & Reply)

**Files:**
- Modify: `src/modules/chat/application/message/send_message_use_case.ts`
- Modify: `src/modules/chat/application/message/reply_to_message_use_case.ts`

- [ ] **Step 1: Update SendMessageUseCase**
Inject `AudioProcessorInterface`. Update `processAttachments` to handle `audio/` mime types using the processor.

- [ ] **Step 2: Update ReplyToMessageUseCase**
Inject `AudioProcessorInterface`. Update `processAttachments` to handle `audio/` mime types.

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/application/message/send_message_use_case.ts src/modules/chat/application/message/reply_to_message_use_case.ts
git commit -m "feat: support voice messages in send and reply use cases"
```

### Task 6: ResendMessageUseCase Fix (Attachment Copying)

**Files:**
- Modify: `src/modules/chat/application/message/resend_message_use_case.ts`

- [ ] **Step 1: Update resendMessageUseCase**
Fetch original message with attachments. For each attachment, create a new `Attachment` entity (new ID, same blob) and include them in the new resent message.

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/application/message/resend_message_use_case.ts
git commit -m "fix: ensure attachments are copied when resending messages"
```

### Task 7: DI Container Assembly

**Files:**
- Modify: `src/container.ts`

- [ ] **Step 1: Register AudioProcessor**
Instantiate `FfmpegAudioProcessor` and inject it into the use cases.

- [ ] **Step 2: Commit**
```bash
git add src/container.ts
git commit -m "chore: register audio processor in DI container"
```

### Task 8: Verification

- [ ] **Step 1: Run existing tests**
Run: `npm test`
Ensure no regressions.

- [ ] **Step 2: Manual verification (Optional/Instructional)**
Verify the REST endpoints with an audio file upload.
