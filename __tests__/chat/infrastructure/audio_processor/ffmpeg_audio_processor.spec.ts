import { FfmpegAudioProcessor } from "../../../../src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Writable } from "stream";

jest.mock("fluent-ffmpeg");

describe("FfmpegAudioProcessor", () => {
    let audioProcessor: FfmpegAudioProcessor;

    beforeEach(() => {
        audioProcessor = new FfmpegAudioProcessor();
        jest.clearAllMocks();
    });

    it("should process audio and return data, duration and mimeType", async () => {
        const mockBuffer = Buffer.from("fake audio data");
        const mockDuration = 10;

        const mockFfmpegCommand: any = {
            input: jest.fn().mockReturnThis(),
            audioCodec: jest.fn().mockReturnThis(),
            toFormat: jest.fn().mockReturnThis(),
            duration: jest.fn().mockReturnThis(),
            noVideo: jest.fn().mockReturnThis(),
            outputOptions: jest.fn().mockReturnThis(),
            on: jest.fn().mockImplementation(function(this: any, event: string, cb: any) {
                if (event === "end") {
                    // Simulate stream end
                    cb();
                }
                return this;
            }),
            pipe: jest.fn().mockImplementation((stream: Writable) => {
                stream.write(Buffer.from("processed data"));
                stream.end();
                return stream;
            })
        };

        (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpegCommand);
        (ffmpeg as unknown as any).ffprobe = jest.fn().mockImplementation((buffer: any, cb: any) => {
            cb(null, { format: { duration: mockDuration } });
        });

        const result = await audioProcessor.processAudio(mockBuffer);

        expect(result.duration).toBe(mockDuration);
        expect(result.mimeType).toBe("audio/ogg");
        expect(result.data).toBeDefined();
        expect(mockFfmpegCommand.audioCodec).toHaveBeenCalledWith("libopus");
        expect(mockFfmpegCommand.toFormat).toHaveBeenCalledWith("ogg");
        expect(mockFfmpegCommand.outputOptions).toHaveBeenCalledWith("-map_metadata", "-1");
    });

    it("should throw error if ffprobe fails", async () => {
        const mockBuffer = Buffer.from("fake audio data");

        (ffmpeg as unknown as any).ffprobe = jest.fn().mockImplementation((buffer: any, cb: any) => {
            cb(new Error("ffprobe error"));
        });

        await expect(audioProcessor.processAudio(mockBuffer)).rejects.toThrow("ffprobe error");
    });
});
