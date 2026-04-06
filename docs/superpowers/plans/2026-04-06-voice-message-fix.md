# Voice Message Feature Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix issues with voice message classification, missing imports, incorrect extensions, and duration precision to provide a robust and polished feature.

**Architecture:** Use Approach 1 (Strict Recording Type). Only specific mime-types (`audio/webm`, `audio/ogg`) are treated as voice messages. Optimize `FfmpegAudioProcessor` with proper extensions, bitrate control, and duration rounding. Fix domain entities by adding missing `crypto` imports.

**Tech Stack:** Node.js, TypeScript, PostgreSQL, fluent-ffmpeg, ffprobe.

---

### Task 1: Domain Entities Fix

**Files:**
- Modify: `src/modules/chat/domain/message/attachment.ts`
- Modify: `src/modules/chat/domain/message/message.ts`

- [ ] **Step 1: Add crypto import to attachment.ts**
```typescript
import * as crypto from "crypto";
// ... rest of imports
```

- [ ] **Step 2: Add crypto import to message.ts**
```typescript
import * as crypto from "crypto";
// ... rest of imports
```

- [ ] **Step 3: Run existing tests to ensure no regressions**
Run: `npm test __tests__/chat/message/application/send_message_use_case.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/modules/chat/domain/message/attachment.ts src/modules/chat/domain/message/message.ts
git commit -m "fix(domain): add missing crypto imports"
```

### Task 2: Audio Processor Enhancements

**Files:**
- Modify: `src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts`

- [ ] **Step 1: Update FfmpegAudioProcessor implementation**
Use `.tmp` extension for temp files, set `32k` bitrate, round duration to integer, and remove noisy logging.

```typescript
import { AudioProcessorInterface } from "../../domain/ports/audio_processor_interface";
import ffmpeg from "fluent-ffmpeg";
import { Readable, PassThrough } from "stream";
import { writeFile, unlink } from "fs/promises";
import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";

export class FfmpegAudioProcessor implements AudioProcessorInterface {
    async processAudio(buffer: Buffer): Promise<{ data: Buffer; duration: number; mimeType: string }> {
        const tmpFile = path.join(os.tmpdir(), `audio_${crypto.randomUUID()}.tmp`);
        await writeFile(tmpFile, buffer);

        try {
            const rawDuration = await this.getDuration(tmpFile);
            const duration = Math.round(rawDuration);
            
            const outputStream = new PassThrough();
            const chunks: Buffer[] = [];
            
            outputStream.on("data", (chunk) => chunks.push(chunk));
            
            return await new Promise((resolve, reject) => {
                ffmpeg(tmpFile)
                    .audioCodec("libopus")
                    .audioBitrate("32k")
                    .toFormat("ogg")
                    .duration(600) // Enforce 10 min limit
                    .noVideo()
                    .outputOptions("-map_metadata", "-1") // Strip metadata
                    .on("error", (err) => {
                        reject(err);
                    })
                    .on("end", () => {
                        resolve({
                            data: Buffer.concat(chunks),
                            duration: duration,
                            mimeType: "audio/ogg"
                        });
                    })
                    .pipe(outputStream, { end: true });
            });
        } finally {
            await unlink(tmpFile).catch(() => {});
        }
    }

    private async getDuration(tmpFile: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(tmpFile, (err, metadata) => {
                if (err) return reject(err);
                
                const duration = metadata?.format?.duration;
                if (typeof duration === 'number') {
                    return resolve(duration);
                }
                
                const parsed = parseFloat(duration as any);
                if (!isNaN(parsed)) {
                    return resolve(parsed);
                }
                
                resolve(0);
            });
        });
    }
}
```

- [ ] **Step 2: Run verification script**
Run: `npx tsx test_processor.ts`
Expected: Processing finished, Duration should be an integer (e.g., 5 instead of 5.0).

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor.ts
git commit -m "feat(infra): optimize audio processor with bitrate and duration rounding"
```

### Task 3: Use Case Logic (Approach 1)

**Files:**
- Modify: `src/modules/chat/application/message/send_message_use_case.ts`
- Modify: `src/modules/chat/application/message/reply_to_message_use_case.ts`

- [ ] **Step 1: Update SendMessageUseCase.processAttachments**
Implement mime-type check for voice messages and filename correction.

```typescript
    private async processAttachments(files: FileDTO[]): Promise<Attachment[]> {
        const attachments: Attachment[] = [];

        for (const file of files) {
            const isClean = await this.virusScanner.scanBuffer(file.buffer);
            if (!isClean) {
                throw new InsecureAttachmentError(`File ${file.originalname} is infected`);
            }

            let processedBuffer = file.buffer;
            let mimeType = file.mimetype;
            let type: AttachmentType = 'file';
            let duration: number | undefined = undefined;
            let originalName = file.originalname;

            if (file.mimetype.startsWith('image/')) {
                const processed = await this.imageProcessor.processImage(file.buffer);
                processedBuffer = processed.data;
                mimeType = processed.mimeType;
                type = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                processedBuffer = await this.videoProcessor.stripMetadata(file.buffer);
                type = 'video';
            } else if (
                file.mimetype === 'audio/webm' || 
                file.mimetype === 'audio/ogg' || 
                file.mimetype === 'audio/webm; codecs=opus'
            ) {
                const processed = await this.audioProcessor.processAudio(file.buffer);
                processedBuffer = processed.data;
                mimeType = processed.mimeType;
                type = 'voice';
                duration = processed.duration;
                
                // Correct extension if it was converted to ogg
                if (!originalName.toLowerCase().endsWith('.ogg')) {
                    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                    originalName = `${baseName}.ogg`;
                }
            }

            const blobId = await this.blobRepo.save(processedBuffer);
            attachments.push(Attachment.create(
                blobId,
                type,
                originalName,
                mimeType,
                processedBuffer.length,
                duration
            ));
        }

        return attachments;
    }
```

- [ ] **Step 2: Update ReplyToMessageUseCase.processAttachments**
Apply the same logic as in Step 1.

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/application/message/send_message_use_case.ts src/modules/chat/application/message/reply_to_message_use_case.ts
git commit -m "feat(use-case): implement strict voice message detection and filename correction"
```

### Task 4: Verification and Tests

**Files:**
- Modify: `__tests__/chat/message/application/send_message_use_case.spec.ts`

- [ ] **Step 1: Add test case for regular audio file**
Verify that `audio/mpeg` is treated as a `file`.

```typescript
    it("should treat regular audio files as generic files", async () => {
        const participant = { getCanSendMessages: () => true };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "group" });
        participantRepo.getParticipants.mockResolvedValue({ items: [{ userId: USER_ID }] });
        conversationRepo.getMaxReadAtForOthers.mockResolvedValue(new Date());
        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const files = [
            { buffer: Buffer.from("audio"), originalname: "song.mp3", mimetype: "audio/mpeg", size: 5 }
        ];

        await useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "", files);

        expect(audioProcessor.processAudio).not.toHaveBeenCalled();
        expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            attachments: expect.arrayContaining([
                expect.objectContaining({
                    name: "song.mp3",
                    type: "file"
                })
            ])
        }));
    });
```

- [ ] **Step 2: Add test case for voice recording**
Verify that `audio/webm; codecs=opus` is treated as a `voice` message with `.ogg` extension.

```typescript
    it("should treat webm recordings as voice messages and correct extension", async () => {
        const participant = { getCanSendMessages: () => true };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "group" });
        participantRepo.getParticipants.mockResolvedValue({ items: [{ userId: USER_ID }] });
        conversationRepo.getMaxReadAtForOthers.mockResolvedValue(new Date());
        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const files = [
            { buffer: Buffer.from("audio"), originalname: "voice.webm", mimetype: "audio/webm; codecs=opus", size: 5 }
        ];

        await useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "", files);

        expect(audioProcessor.processAudio).toHaveBeenCalled();
        expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            attachments: expect.arrayContaining([
                expect.objectContaining({
                    name: "voice.ogg",
                    type: "voice",
                    duration: 10
                })
            ])
        }));
    });
```

- [ ] **Step 3: Run all tests**
Run: `npm test __tests__/chat/message/application/send_message_use_case.spec.ts`
Expected: ALL PASS

- [ ] **Step 4: Cleanup temp files**
Run: `rm test_gen.wav test_output.ogg test_processor.ts`

- [ ] **Step 5: Commit**
```bash
git add __tests__/chat/message/application/send_message_use_case.spec.ts
git commit -m "test: add verification for voice vs file audio detection"
```
