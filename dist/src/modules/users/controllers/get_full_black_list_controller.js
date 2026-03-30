"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFullBlackListController = void 0;
class GetFullBlackListController {
    getFullBlackListService;
    extractUserId;
    constructor(getFullBlackListService, extractUserId) {
        this.getFullBlackListService = getFullBlackListService;
        this.extractUserId = extractUserId;
    }
    getFullBlackListController = async (req, res) => {
        const userId = this.extractUserId.extractUserId(req);
        const result = await this.getFullBlackListService.getFullBlackListTxService(userId);
        return res.status(200).json(result);
    };
}
exports.GetFullBlackListController = GetFullBlackListController;
