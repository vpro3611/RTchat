import {Request, Response} from "express";
import {BlobRepositoryPg} from "../../repositories_pg_realization/blob_repository_pg";
import {AttachmentRepositoryPg} from "../../repositories_pg_realization/attachment_repository_pg";

export class GetAttachmentController {
    constructor(
        private readonly blobRepo: BlobRepositoryPg,
        private readonly attachmentRepo: AttachmentRepositoryPg
    ) {}

    async getAttachment(req: Request, res: Response) {
        try {
            const blobId = req.params.blobId as string;
            
            if (!blobId) {
                return res.status(400).json({ error: "blobId is required" });
            }

            const blob = await this.blobRepo.getById(blobId);
            if (!blob) {
                return res.status(404).json({ error: "Attachment not found" });
            }

            // Try to find attachment metadata to get the correct mime type
            const attachment = await this.attachmentRepo.findByBlobId(blobId);
            const contentType = attachment ? attachment.mimeType : "application/octet-stream";

            res.setHeader("Content-Type", contentType);
            // Optionally set Content-Disposition if we have the name
            if (attachment) {
                res.setHeader("Content-Disposition", `inline; filename="${attachment.name}"`);
            }

            return res.send(blob);
        } catch (error) {
            console.error("Error getting attachment:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
