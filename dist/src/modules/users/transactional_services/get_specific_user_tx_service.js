"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificUserTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const get_specific_user_use_case_1 = require("../application/get_specific_user_use_case");
class GetSpecificUserTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getSpecificUserTxService(actorId, targetId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userMapper = new map_to_dto_1.UserMapper();
            const userLookup = new user_exists_by_id_1.UserLookup(userRepo);
            const getSpecificUserUseCase = new get_specific_user_use_case_1.GetSpecificUserUseCase(userLookup, userMapper);
            return await getSpecificUserUseCase.getSpecificUserUseCase(actorId, targetId);
        });
    }
}
exports.GetSpecificUserTxService = GetSpecificUserTxService;
