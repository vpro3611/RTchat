"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFullBlackListTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const user_to_user_blocks_pg_1 = require("../repositories/user_to_user_blocks_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const get_full_black_list_use_case_1 = require("../application/get_full_black_list_use_case");
class GetFullBlackListTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async getFullBlackListTxService(actorId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userLookup = new user_exists_by_id_1.UserLookup(userRepoReader);
            const userToUserBlocksRepo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
            const userMapper = new map_to_dto_1.UserMapper();
            const getFullBlackListUseCase = new get_full_black_list_use_case_1.GetFullBlackListUseCase(userToUserBlocksRepo, userLookup, userMapper);
            return await getFullBlackListUseCase.getFullBlackListUseCase(actorId);
        });
    }
}
exports.GetFullBlackListTxService = GetFullBlackListTxService;
