"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSelfProfileController = void 0;
class GetSelfProfileController {
    getSelfProfileService;
    extractUserId;
    constructor(getSelfProfileService, extractUserId) {
        this.getSelfProfileService = getSelfProfileService;
        this.extractUserId = extractUserId;
    }
    getSelfProfileCont = async (req, res) => {
        const actorId = this.extractUserId.extractUserId(req);
        const result = await this.getSelfProfileService.getSelfProfileTxService(actorId);
        return res.status(200).json(result);
    };
}
exports.GetSelfProfileController = GetSelfProfileController;
