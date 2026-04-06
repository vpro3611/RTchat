import { Attachment } from "../../../../src/modules/chat/domain/message/attachment";

describe("Attachment Domain", () => {
    it("should create attachment", () => {
        const attachment = Attachment.create(
            "blob-1",
            "image",
            "test.png",
            "image/png",
            1024
        );

        expect(attachment.id).toBeDefined();
        expect(attachment.blobId).toBe("blob-1");
        expect(attachment.type).toBe("image");
        expect(attachment.name).toBe("test.png");
        expect(attachment.mimeType).toBe("image/png");
        expect(attachment.size).toBe(1024);
        expect(attachment.createdAt).toBeInstanceOf(Date);
    });

    it("should restore attachment", () => {
        const now = new Date();
        const attachment = Attachment.restore(
            "att-1",
            "blob-1",
            "video",
            "movie.mp4",
            "video/mp4",
            2048,
            now
        );

        expect(attachment.id).toBe("att-1");
        expect(attachment.blobId).toBe("blob-1");
        expect(attachment.type).toBe("video");
        expect(attachment.name).toBe("movie.mp4");
        expect(attachment.mimeType).toBe("video/mp4");
        expect(attachment.size).toBe(2048);
        expect(attachment.createdAt).toBe(now);
    });

    it("should create voice attachment with duration", () => {
        const attachment = Attachment.create(
            "blob-voice",
            "voice",
            "voice.mp3",
            "audio/mp3",
            500,
            30
        );

        expect(attachment.type).toBe("voice");
        expect(attachment.duration).toBe(30);
    });

    it("should restore voice attachment with duration", () => {
        const now = new Date();
        const attachment = Attachment.restore(
            "att-voice",
            "blob-voice",
            "voice",
            "voice.mp3",
            "audio/mp3",
            500,
            now,
            30
        );

        expect(attachment.type).toBe("voice");
        expect(attachment.duration).toBe(30);
    });
});
