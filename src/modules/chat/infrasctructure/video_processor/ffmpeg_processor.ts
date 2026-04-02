import ffmpeg from "fluent-ffmpeg";
import { VideoProcessorInterface } from "../../domain/ports/video_processor_interface";
import fs from "fs/promises";
import path from "path";
import os from "os";

export class VideoProcessor implements VideoProcessorInterface {
    async stripMetadata(buffer: Buffer): Promise<Buffer> {
        const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.tmp`);
        const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.mp4`);

        try {
            // Write buffer to a temporary file (FFmpeg needs seekable input for some formats)
            await fs.writeFile(tempInput, buffer);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(tempInput)
                    .outputOptions("-map_metadata -1") // Strip metadata
                    .outputOptions("-movflags +faststart") // Move moov atom to start for web playback
                    .videoFilters('scale=trunc(iw/2)*2:trunc(ih/2)*2') // Ensure even dimensions for H.264 (Fixed syntax)
                    .videoCodec("libx264") // Ensure compatible codec
                    .audioCodec("aac") // Ensure compatible audio
                    .format("mp4")
                    .outputOptions("-preset superfast") // Prioritize speed
                    .on("error", (err, stdout, stderr) => {
                        console.error("FFmpeg Error:", err.message);
                        console.error("FFmpeg stderr:", stderr);
                        reject(err);
                    })
                    .on("end", () => resolve())
                    .save(tempOutput);
            });

            // Read the processed file back into a Buffer
            const processedBuffer = await fs.readFile(tempOutput);
            return processedBuffer;
        } finally {
            // Cleanup temporary files
            await Promise.all([
                fs.unlink(tempInput).catch(() => {}),
                fs.unlink(tempOutput).catch(() => {})
            ]);
        }
    }
}
