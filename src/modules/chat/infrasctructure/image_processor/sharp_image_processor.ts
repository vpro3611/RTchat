import sharp from "sharp";
import { ImageProcessorInterface } from "../../domain/ports/image_processor_interface";

export class ImageProcessor implements ImageProcessorInterface {
    async processAvatar(buffer: Buffer): Promise<{ data: Buffer; mimeType: string }> {
        const processed = await sharp(buffer)
            .resize(500, 500, { fit: "cover", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        
        return { data: processed, mimeType: "image/webp" };
    }
}
