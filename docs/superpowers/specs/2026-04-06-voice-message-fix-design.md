# Voice Message Feature Fix Design

## Purpose
Fix the backend implementation of the voice message feature, which currently misclassifies all audio as voice messages, suffers from missing imports, uses incorrect file extensions after conversion, and has potential database insertion issues due to unrounded durations.

## Architecture & Components

### 1. Domain Entities (`src/modules/chat/domain/message/attachment.ts`, `src/modules/chat/domain/message/message.ts`)
- **Fix:** Add missing `import * as crypto from "crypto";` to support `crypto.randomUUID()`.

### 2. Audio Processor (`src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts`)
- **Temp File Extension:** Use generic `.tmp` instead of hardcoded `.webm` for the input buffer so FFmpeg can auto-detect the format.
- **Bitrate:** Set Opus bitrate explicitly to `32k` (`-b:a 32k`) for optimized voice storage.
- **Duration:** Parse `ffprobe` output as a float and return `Math.round(duration)` to ensure it's an integer for the PostgreSQL `duration` column.
- **Logging:** Remove noisy `console.log("FFMPEG STDERR:", stdLine)` to keep production logs clean.

### 3. Use Cases (`src/modules/chat/application/message/send_message_use_case.ts`, `src/modules/chat/application/message/reply_to_message_use_case.ts`)
- **Heuristic (Approach 1):** Modify `processAttachments` to only treat files as `voice` if their mime-type is `audio/webm; codecs=opus`, `audio/webm`, or `audio/ogg`.
    - **Voice Messages:** Processed by `AudioProcessor`, typed as `voice`, assigned a duration, and filename extension updated to `.ogg`.
    - **Other Audio:** Treated as generic `file` attachments with no processing or duration.

## Data Flow
1. Client uploads an audio file via `/messages` endpoint.
2. `SendMessageUseCase` or `ReplyToMessageUseCase` checks the mime-type.
3. If it's a voice recording (`audio/webm` or `audio/ogg`), it's passed to `FfmpegAudioProcessor`.
4. `FfmpegAudioProcessor` writes to a temp `.tmp` file, runs `ffprobe` to get duration (rounded to int), runs `ffmpeg` to convert to OGG/Opus at 32k, and returns the buffer.
5. The processed buffer is saved to `blob_repository_pg`.
6. An `Attachment` entity is created with type `voice`, duration, and `.ogg` extension, and saved to `attachment_repository_pg`.

## Error Handling
- FFmpeg stream errors will be caught and rejected, bubbling up to the Use Case where standard error mapping handles them.
- Temp files are strictly cleaned up in a `finally` block to prevent disk leaks.

## Testing
- Update `__tests__/chat/message/application/send_message_use_case.spec.ts` to verify that `audio/mpeg` is treated as a `file` and `audio/webm; codecs=opus` is treated as a `voice` message.
