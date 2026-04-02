import ffmpeg from "fluent-ffmpeg";
import { Readable, Writable } from "stream";
import { VideoProcessorInterface } from "../../domain/ports/video_processor_interface";

export class VideoProcessor implements VideoProcessorInterface {
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
