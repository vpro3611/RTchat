"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleStatusTxService = void 0;
const user_repo_writer_pg_1 = require("../repositories/user_repo_writer_pg");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const toggle_status_use_case_1 = require("../application/toggle_status_use_case");
class ToggleStatusTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async toggleStatusTxService(actorId) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userLookup = new user_exists_by_id_1.UserLookup(userRepoReader);
            const mapper = new map_to_dto_1.UserMapper();
            const toggleStatusUseCase = new toggle_status_use_case_1.ToggleIsActiveUseCase(userRepoWriter, mapper, userLookup);
            return await toggleStatusUseCase.toggleIsActiveUseCase(actorId);
        });
    }
}
exports.ToggleStatusTxService = ToggleStatusTxService;
