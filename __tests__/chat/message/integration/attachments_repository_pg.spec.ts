import { BlobRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/blob_repository_pg";
import { AttachmentRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/attachment_repository_pg";
import { Attachment } from "../../../../src/modules/chat/domain/message/attachment";
import { CryptoEncryptionService } from "../../../../src/modules/infrasctructure/crypto_encryption_service";
import * as crypto from "crypto";

describe("Attachments Repositories (with mocked client)", () => {
    let client: any;
    let blobRepo: BlobRepositoryPg;
    let attachmentRepo: AttachmentRepositoryPg;
    let encryptionService: CryptoEncryptionService;
    const TEST_KEY = crypto.randomBytes(32).toString('hex');

    beforeEach(() => {
        client = {
            query: jest.fn(),
        };
        encryptionService = new CryptoEncryptionService(TEST_KEY);
        blobRepo = new BlobRepositoryPg(client, encryptionService);
        attachmentRepo = new AttachmentRepositoryPg(client, encryptionService);
    });

    describe("BlobRepositoryPg", () => {
        it("should save blob and return id", async () => {
            const buffer = Buffer.from("test");
            client.query.mockResolvedValueOnce({ rows: [{ id: "blob-id" }] });

            const id = await blobRepo.save(buffer);

            expect(id).toBe("blob-id");
            const call = client.query.mock.calls[0];
            expect(call[0]).toContain("INSERT INTO attachment_blobs (data) VALUES ($1) RETURNING id");
            
            const encryptedBuffer = call[1][0];
            expect(encryptedBuffer).not.toEqual(buffer);
            expect(encryptionService.decryptFromBuffer(encryptedBuffer)).toEqual(buffer);
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

        it("should save attachment and encrypt name", async () => {
            client.query.mockResolvedValueOnce({});

            await attachmentRepo.save(messageId, attachment);

            const call = client.query.mock.calls[0];
            expect(call[0]).toContain("INSERT INTO message_attachments");
            
            const encryptedName = call[1][4];
            expect(encryptedName).not.toBe(attachment.name);
            expect(encryptionService.decrypt(encryptedName)).toBe(attachment.name);
        });

        it("should find attachments and decrypt name", async () => {
            const encryptedName = encryptionService.encrypt(attachment.name);
            const row = {
                id: attachment.id,
                blob_id: attachment.blobId,
                type: attachment.type,
                name: encryptedName,
                mime_type: attachment.mimeType,
                size: attachment.size,
                created_at: now,
            };
            client.query.mockResolvedValueOnce({ rows: [row] });

            const result = await attachmentRepo.findByMessageId(messageId);

            expect(result.length).toBe(1);
            expect(result[0]).toEqual(attachment);
        });

        it("should save and retrieve attachment with duration", async () => {
            const voiceAttachment = Attachment.restore(
                "voice-id",
                "blob-id",
                "voice",
                "voice.ogg",
                "audio/ogg",
                5000,
                now,
                120
            );

            // Test Save
            client.query.mockResolvedValueOnce({});
            await attachmentRepo.save(messageId, voiceAttachment);
            const saveCall = client.query.mock.calls[0];
            expect(saveCall[0]).toContain("duration");
            expect(saveCall[1]).toContain(120);

            // Test Find
            const encryptedName = encryptionService.encrypt(voiceAttachment.name);
            const row = {
                id: voiceAttachment.id,
                blob_id: voiceAttachment.blobId,
                type: voiceAttachment.type,
                name: encryptedName,
                mime_type: voiceAttachment.mimeType,
                size: voiceAttachment.size,
                created_at: now,
                duration: 120
            };
            client.query.mockResolvedValueOnce({ rows: [row] });
            const result = await attachmentRepo.findByMessageId(messageId);
            expect(result[0].duration).toBe(120);
        });
    });
});
