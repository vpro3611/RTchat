"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeUsernameController = exports.ChangeUsernameBodySchema = void 0;
const zod_1 = require("zod");
exports.ChangeUsernameBodySchema = zod_1.z.object({
    newUsername: zod_1.z.string(),
});
class ChangeUsernameController {
    changeUsernameService;
    extractUserIdFromReq;
    constructor(changeUsernameService, extractUserIdFromReq) {
        this.changeUsernameService = changeUsernameService;
        this.extractUserIdFromReq = extractUserIdFromReq;
    }
    changeUsernameController = async (req, res) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);
        const { newUsername } = req.body;
        const result = await this.changeUsernameService.changeUsernameTxService(userId, newUsername);
        return res.status(200).json(result);
    };
}
exports.ChangeUsernameController = ChangeUsernameController;
