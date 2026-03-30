"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSelfProfileTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const get_self_profile_use_case_1 = require("../application/get_self_profile_use_case");
class GetSelfProfileTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSelfProfileTxService(actorId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userLookup = new user_exists_by_id_1.UserLookup(userRepo);
            const getSelfProfileUseCase = new get_self_profile_use_case_1.GetSelfProfileUseCase(userLookup);
            return await getSelfProfileUseCase.getSelfProfileUseCase(actorId);
        });
    }
}
exports.GetSelfProfileTxService = GetSelfProfileTxService;
