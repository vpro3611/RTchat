"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("../repositories/user_repo_writer_pg");
const bcrypter_1 = require("../../infrasctructure/ports/bcrypter/bcrypter");
const map_to_dto_1 = require("../shared/map_to_dto");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const change_password_use_case_1 = require("../application/change_password_use_case");
class ChangePasswordTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async changePasswordTxService(actorId, oldPassword, newPassword) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userRepoWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const bcrypter = new bcrypter_1.Bcrypter();
            const mapper = new map_to_dto_1.UserMapper();
            const userLookup = new user_exists_by_id_1.UserLookup(userRepoReader);
            const changePasswordUseCase = new change_password_use_case_1.ChangePasswordUseCase(userRepoReader, userRepoWriter, bcrypter, mapper, userLookup);
            return await changePasswordUseCase.changePasswordUseCase(actorId, oldPassword, newPassword);
        });
    }
}
exports.ChangePasswordTxService = ChangePasswordTxService;
