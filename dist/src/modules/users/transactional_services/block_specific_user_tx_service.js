"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSpecificUserTxService = void 0;
const user_to_user_blocks_pg_1 = require("../repositories/user_to_user_blocks_pg");
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const block_specific_user_use_case_1 = require("../application/block_specific_user_use_case");
class BlockSpecificUserTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async blockSpecificUserTxService(actorId, targetId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userToUserBlocksRepo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userMapper = new map_to_dto_1.UserMapper();
            const blockSpecificUserUseCase = new block_specific_user_use_case_1.BlockSpecificUserUseCase(userToUserBlocksRepo, userRepoReader, userMapper);
            return await blockSpecificUserUseCase.blockSpecificUserUseCase(actorId, targetId);
        });
    }
}
exports.BlockSpecificUserTxService = BlockSpecificUserTxService;
