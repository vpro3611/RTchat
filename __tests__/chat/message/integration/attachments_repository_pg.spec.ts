import { BlobRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/blob_repository_pg";
import { AttachmentRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/attachment_repository_pg";
import { Attachment } from "../../../../src/modules/chat/domain/message/attachment";
import { PoolClient } from "pg";

describe("Attachments Repositories (with mocked client)", () => {
    let client: any;
    let blobRepo: BlobRepositoryPg;
    let attachmentRepo: AttachmentRepositoryPg;

    beforeEach(() => {
        client = {
            query: jest.fn(),
        };
        blobRepo = new BlobRepositoryPg(client);
        attachmentRepo = new AttachmentRepositoryPg(client);
    });

    describe("BlobRepositoryPg", () => {
        it("should save blob and return id", async () => {
            const buffer = Buffer.from("test");
            client.query.mockResolvedValueOnce({ rows: [{ id: "blob-id" }] });

            const id = await blobRepo.save(buffer);

            expect(id).toBe("blob-id");
            expect(client.query).toHaveBeenCalledWith(
                "INSERT INTO attachment_blobs (data) VALUES ($1) RETURNING id",
                [buffer]
            );
        });
    });

    describe("AttachmentRepositoryPg", () => {
        const messageId = "message-id";
        const now = new Date();
        const attachment = Attachment.restore(
            "attachment-id",
            "blob-id",
            "image",
            "test.jpg",
            "image/jpeg",
            1024,
            now
        );

        it("should save attachment", async () => {
            client.query.mockResolvedValueOnce({});

            await attachmentRepo.save(messageId, attachment);

            expect(client.query).toHaveBeenCalledWith(
                "INSERT INTO message_attachments (id, message_id, blob_id, type, name, mime_type, size, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [attachment.id, messageId, attachment.blobId, attachment.type, attachment.name, attachment.mimeType, attachment.size, attachment.createdAt]
            );
        });

        it("should find attachments by message id", async () => {
            const row = {
                id: attachment.id,
                blob_id: attachment.blobId,
                type: attachment.type,
                name: attachment.name,
                mime_type: attachment.mimeType,
                size: attachment.size,
                created_at: now,
            };
            client.query.mockResolvedValueOnce({ rows: [row] });

            const result = await attachmentRepo.findByMessageId(messageId);

            expect(result.length).toBe(1);
            expect(result[0]).toEqual(attachment);
            expect(client.query).toHaveBeenCalledWith(
                "SELECT * FROM message_attachments WHERE message_id = $1",
                [messageId]
            );
        });
    });
});
