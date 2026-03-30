"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUserAvatarController = void 0;
class SetUserAvatarController {
    setUserAvatarService;
    extractActorId;
    constructor(setUserAvatarService, extractActorId) {
        this.setUserAvatarService = setUserAvatarService;
        this.extractActorId = extractActorId;
    }
    setAvatar = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        if (!req.file) {
            return res.status(400).json({ message: "Avatar file is required" });
        }
        const avatarId = await this.setUserAvatarService.setUserAvatar(actorId.sub, req.file.buffer);
        return res.status(201).json({ avatarId });
    };
}
exports.SetUserAvatarController = SetUserAvatarController;
