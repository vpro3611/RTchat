import { VideoProcessor } from "../../../../src/modules/chat/infrasctructure/video_processor/ffmpeg_processor";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";

jest.mock("fluent-ffmpeg");
jest.mock("fs/promises");

describe("VideoProcessor", () => {
    let processor: VideoProcessor;
    let mockFfmpeg: any;

    beforeEach(() => {
        processor = new VideoProcessor();
        mockFfmpeg = {
            outputOptions: jest.fn().mockReturnThis(),
            videoFilters: jest.fn().mockReturnThis(),
            videoCodec: jest.fn().mockReturnThis(),
            audioCodec: jest.fn().mockReturnThis(),
            format: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            save: jest.fn().mockImplementation((path: string) => {
                const endCallback = mockFfmpeg.on.mock.calls.find((call: any) => call[0] === "end")[1];
                endCallback();
            })
        };
        const mockFfmpegCtor = (ffmpeg as any).default || ffmpeg;
        (mockFfmpegCtor as jest.Mock).mockReturnValue(mockFfmpeg);
        
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
        (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from("processed data"));
        (fs.unlink as jest.Mock).mockResolvedValue(undefined);
    });

    it("should strip metadata and format to mp4", async () => {
        const inputBuffer = Buffer.from("test video");
        const result = await processor.stripMetadata(inputBuffer);

        expect(result).toEqual(Buffer.from("processed data"));
        expect(fs.writeFile).toHaveBeenCalled();
        expect(mockFfmpeg.outputOptions).toHaveBeenCalledWith("-map_metadata -1");
        expect(mockFfmpeg.format).toHaveBeenCalledWith("mp4");
        expect(fs.readFile).toHaveBeenCalled();
        expect(fs.unlink).toHaveBeenCalledTimes(2);
    });

    it("should reject on ffmpeg error", async () => {
        mockFfmpeg.save.mockImplementation(() => {
            const errorCallback = mockFfmpeg.on.mock.calls.find((call: any) => call[0] === "error")[1];
            errorCallback(new Error("ffmpeg error"), "", "some stderr");
        });

        const inputBuffer = Buffer.from("test video");
        await expect(processor.stripMetadata(inputBuffer)).rejects.toThrow("ffmpeg error");
    });
});
