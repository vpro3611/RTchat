import { AudioProcessorInterface } from "../../domain/ports/audio_processor_interface";
import ffmpeg from "fluent-ffmpeg";
import { Readable, PassThrough } from "stream";

export class FfmpegAudioProcessor implements AudioProcessorInterface {
    async processAudio(buffer: Buffer): Promise<{ data: Buffer; duration: number; mimeType: string }> {
        const duration = await this.getDuration(buffer);
        
        const outputStream = new PassThrough();
        const chunks: Buffer[] = [];
        
        outputStream.on("data", (chunk) => chunks.push(chunk));
        
        return new Promise((resolve, reject) => {
            const readable = Readable.from(buffer);
            
            ffmpeg(readable)
                .audioCodec("libopus")
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
    }

    private getDuration(buffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            const readable = Readable.from(buffer);
            ffmpeg.ffprobe(readable as any, (err, metadata) => {
                if (err) return reject(err);
                resolve(metadata.format.duration || 0);
            });
        });
    }
}
