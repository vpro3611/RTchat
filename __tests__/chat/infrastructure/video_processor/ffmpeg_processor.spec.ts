import { VideoProcessor } from "../../../../src/modules/chat/infrasctructure/video_processor/ffmpeg_processor";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Writable } from "stream";

jest.mock("fluent-ffmpeg");

describe("VideoProcessor", () => {
    let processor: VideoProcessor;
    let mockFfmpeg: any;

    beforeEach(() => {
        processor = new VideoProcessor();
        mockFfmpeg = {
            outputOptions: jest.fn().mockReturnThis(),
            toFormat: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            pipe: jest.fn().mockImplementation((stream: Writable) => {
                stream.write(Buffer.from("processed data"));
                const endCallback = mockFfmpeg.on.mock.calls.find((call: any) => call[0] === "end")[1];
                endCallback();
                return stream;
            })
        };
        (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);
    });

    it("should strip metadata and format to mp4", async () => {
        const inputBuffer = Buffer.from("test video");
        const result = await processor.stripMetadata(inputBuffer);

        expect(result).toEqual(Buffer.from("processed data"));
        expect(ffmpeg).toHaveBeenCalledWith(expect.any(Readable));
        expect(mockFfmpeg.outputOptions).toHaveBeenCalledWith("-map_metadata -1");
        expect(mockFfmpeg.toFormat).toHaveBeenCalledWith("mp4");
    });

    it("should reject on ffmpeg error", async () => {
        mockFfmpeg.pipe.mockImplementation(() => {
            const errorCallback = mockFfmpeg.on.mock.calls.find((call: any) => call[0] === "error")[1];
            errorCallback(new Error("ffmpeg error"));
        });

        const inputBuffer = Buffer.from("test video");
        await expect(processor.stripMetadata(inputBuffer)).rejects.toThrow("ffmpeg error");
    });
});
