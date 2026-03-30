"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleStatusController = void 0;
class ToggleStatusController {
    toggleStatusService;
    extractUserIdFromReq;
    constructor(toggleStatusService, extractUserIdFromReq) {
        this.toggleStatusService = toggleStatusService;
        this.extractUserIdFromReq = extractUserIdFromReq;
    }
    toggleStatusController = async (req, res) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);
        const result = await this.toggleStatusService.toggleStatusTxService(userId);
        return res.status(200).json(result);
    };
}
exports.ToggleStatusController = ToggleStatusController;
