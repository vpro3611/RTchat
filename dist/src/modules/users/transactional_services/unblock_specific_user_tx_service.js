"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockSpecificUserTxService = void 0;
const user_to_user_blocks_pg_1 = require("../repositories/user_to_user_blocks_pg");
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const unblock_specific_user_use_case_1 = require("../application/unblock_specific_user_use_case");
class UnblockSpecificUserTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async unblockSpecificUserTxService(actorId, targetId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userToUserBlocksRepo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userMapper = new map_to_dto_1.UserMapper();
            const unblockSpecificUserUseCase = new unblock_specific_user_use_case_1.UnblockSpecificUserUseCase(userToUserBlocksRepo, userRepoReader, userMapper);
            return await unblockSpecificUserUseCase.unblockSpecificUserUseCase(actorId, targetId);
        });
    }
}
exports.UnblockSpecificUserTxService = UnblockSpecificUserTxService;
