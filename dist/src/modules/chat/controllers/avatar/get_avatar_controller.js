"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAvatarController = void 0;
class GetAvatarController {
    getAvatarUseCase;
    constructor(getAvatarUseCase) {
        this.getAvatarUseCase = getAvatarUseCase;
    }
    execute = async (req, res) => {
        const { avatarId } = req.params;
        const avatar = await this.getAvatarUseCase.execute(avatarId);
        if (!avatar) {
            return res.status(404).send("Avatar not found");
        }
        res.setHeader("Content-Type", avatar.getMimeType());
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.status(200).send(avatar.getData());
    };
}
exports.GetAvatarController = GetAvatarController;
