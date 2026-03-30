"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUsersTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const map_to_dto_1 = require("../shared/map_to_dto");
const search_users_use_case_1 = require("../application/search_users_use_case");
const container_1 = require("../../../container");
class SearchUsersTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async searchUsersTxService(actorId, query, limit, cursor) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userLookup = new user_exists_by_id_1.UserLookup(userRepoReader);
            const userMapper = new map_to_dto_1.UserMapper();
            const searchUsersUseCase = new search_users_use_case_1.SearchUsersUseCase(userRepoReader, userLookup, userMapper, container_1.RedisCacheService);
            return await searchUsersUseCase.searchUsersUseCase(actorId, query, limit, cursor);
        });
    }
}
exports.SearchUsersTxService = SearchUsersTxService;
