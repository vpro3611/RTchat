import { FfmpegAudioProcessor } from "../../../../src/modules/chat/infrasctructure/audio_processor/ffmpeg_audio_processor";
import ffmpeg from "fluent-ffmpeg";
import { Writable } from "stream";

jest.mock("fluent-ffmpeg", () => {
    const m = jest.fn().mockReturnValue({
        audioCodec: jest.fn().mockReturnThis(),
        audioBitrate: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        duration: jest.fn().mockReturnThis(),
        noVideo: jest.fn().mockReturnThis(),
        outputOptions: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockImplementation(function(this: any, stream: Writable) {
            // Find the 'end' event handler and call it
            const endHandler = this.on.mock.calls.find((call: any) => call[0] === "end")?.[1];
            stream.write(Buffer.from("processed data"));
            if (endHandler) endHandler();
            stream.end();
            return stream;
        })
    });
    (m as any).ffprobe = jest.fn();
    return m;
});

describe("FfmpegAudioProcessor", () => {
    let audioProcessor: FfmpegAudioProcessor;

    beforeEach(() => {
        audioProcessor = new FfmpegAudioProcessor();
        jest.clearAllMocks();
    });

    it("should process audio and return data, duration and mimeType", async () => {
        const mockBuffer = Buffer.from("fake audio data");
        const mockDuration = 10;

        (ffmpeg.ffprobe as jest.Mock).mockImplementation((buffer: any, cb: any) => {
            cb(null, { format: { duration: mockDuration } });
        });

        const result = await audioProcessor.processAudio(mockBuffer);

        expect(result.duration).toBe(mockDuration);
        expect(result.mimeType).toBe("audio/ogg");
        expect(result.data).toBeDefined();
    });

    it("should throw error if ffprobe fails", async () => {
        const mockBuffer = Buffer.from("fake audio data");

        (ffmpeg.ffprobe as jest.Mock).mockImplementation((buffer: any, cb: any) => {
            cb(new Error("ffprobe error"));
        });

        await expect(audioProcessor.processAudio(mockBuffer)).rejects.toThrow("ffprobe error");
    });
});
