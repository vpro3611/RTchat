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
