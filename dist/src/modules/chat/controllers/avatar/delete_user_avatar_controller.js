"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserAvatarController = void 0;
class DeleteUserAvatarController {
    deleteUserAvatarService;
    extractActorId;
    constructor(deleteUserAvatarService, extractActorId) {
        this.deleteUserAvatarService = deleteUserAvatarService;
        this.extractActorId = extractActorId;
    }
    deleteAvatar = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        await this.deleteUserAvatarService.deleteUserAvatar(actorId.sub);
        return res.status(204).send();
    };
}
exports.DeleteUserAvatarController = DeleteUserAvatarController;
