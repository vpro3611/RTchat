"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessor = void 0;
const sharp_1 = __importDefault(require("sharp"));
class ImageProcessor {
    async processAvatar(buffer) {
        const processed = await (0, sharp_1.default)(buffer)
            .resize(500, 500, { fit: "cover", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        return { data: processed, mimeType: "image/webp" };
    }
}
exports.ImageProcessor = ImageProcessor;
