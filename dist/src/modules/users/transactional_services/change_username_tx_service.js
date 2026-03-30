"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeUsernameTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("../repositories/user_repo_writer_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const change_username_use_case_1 = require("../application/change_username_use_case");
class ChangeUsernameTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async changeUsernameTxService(actorId, newUsername) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userRepoWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const mapper = new map_to_dto_1.UserMapper();
            const userLookup = new user_exists_by_id_1.UserLookup(userRepoReader);
            const changeUsernameUseCase = new change_username_use_case_1.ChangeUsernameUseCase(userRepoReader, userRepoWriter, mapper, userLookup);
            return await changeUsernameUseCase.changeUsernameUseCase(actorId, newUsername);
        });
    }
}
exports.ChangeUsernameTxService = ChangeUsernameTxService;
