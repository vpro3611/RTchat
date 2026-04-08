# Design Spec: Voice Message Feature

## Overview
Add the ability to record, send, forward (resend), and reply to voice messages in the chat application.

## 1. Database & Schema Changes
### Migration: `migrations/1775412000000_add-duration-to-attachments.ts`
- Add `duration` column to `message_attachments` table:
  ```sql
  ALTER TABLE message_attachments ADD COLUMN duration INTEGER; -- Duration in seconds
  ```

## 2. Domain & DTO Changes
### `src/modules/chat/domain/message/attachment.ts`
- Update `AttachmentType` to include `'voice'`.
- Update `Attachment` class to include `duration: number | undefined`.
- Update `Attachment.create` and `Attachment.restore` to handle `duration`.

### `src/modules/chat/DTO/attachment_dto.ts`
- Add `duration?: number` to `AttachmentDTO`.

### `src/modules/chat/shared/map_to_message.ts`
- Update mapping to include `duration` in attachment objects.

## 3. Infrastructure: Audio Processing
### `src/modules/chat/domain/ports/audio_processor_interface.ts`
- Define `AudioProcessorInterface`:
  ```typescript
  export interface AudioProcessorInterface {
      processAudio(buffer: Buffer): Promise<{ data: Buffer; duration: number; mimeType: string }>;
  }
  ```

### `src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts`
- Realization using `fluent-ffmpeg`.
- Standardize on `audio/ogg` with `libopus` codec (OGG/Opus).
- Calculate duration using `ffprobe`.
- Enforce a 600s (10 min) limit.
- Strip metadata.

## 4. Application Logic (Use Cases)
### `SendMessageUseCase` & `ReplyToMessageUseCase`
- Update `processAttachments` to detect `audio/` mime types.
- Invoke `AudioProcessor` for audio files.
- Set `AttachmentType` to `'voice'` for processed audio.

### `ResendMessageUseCase`
- **BUG FIX / FEATURE:** Update to copy attachments from the source message to the new resent message.
- For each attachment in `originalMessage`, create a new `Attachment` entity (new ID, same `blobId`, same `type`, etc.) and save it via `messageRepo.create`.

## 5. Repository Update
### `AttachmentRepositoryPg.ts`
- Update `save` to insert `duration`.
- Update `findByMessageId` and `findByBlobId` to retrieve `duration`.

## 6. Testing Strategy
- **Unit Tests:**
  - `AudioProcessor`: Verify Opus conversion and duration extraction.
  - `Attachment` domain: Verify `duration` field.
- **Integration Tests:**
  - `SendMessageUseCase`: Verify voice message creation with attachments.
  - `ResendMessageUseCase`: Verify attachments are preserved when forwarding.
  - `ReplyToMessageUseCase`: Verify replying with/to voice messages works.
- **E2E/Controller Tests:**
  - `SendMessageRestController`: Verify REST endpoint handles audio uploads correctly.
