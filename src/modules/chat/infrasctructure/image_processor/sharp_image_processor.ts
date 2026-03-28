import sharp from "sharp";

export class ImageProcessor {
    async processAvatar(buffer: Buffer): Promise<{ data: Buffer; mimeType: string }> {
        const processed = await sharp(buffer)
            .resize(500, 500, { fit: "cover", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        
        return { data: processed, mimeType: "image/webp" };
    }
}
