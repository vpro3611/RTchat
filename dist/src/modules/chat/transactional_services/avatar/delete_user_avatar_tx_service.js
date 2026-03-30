"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserAvatarTxService = void 0;
const avatar_repository_pg_1 = require("../../repositories_pg_realization/avatar_repository_pg");
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("../../../users/repositories/user_repo_writer_pg");
const delete_user_avatar_use_case_1 = require("../../application/avatar/delete_user_avatar_use_case");
const container_1 = require("../../../../container");
class DeleteUserAvatarTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async deleteUserAvatar(userId) {
        return this.txManager.runInTransaction(async (client) => {
            const userReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const avatarRepo = new avatar_repository_pg_1.AvatarRepositoryPg(client);
            const useCase = new delete_user_avatar_use_case_1.DeleteUserAvatarUseCase(userReader, userWriter, avatarRepo, container_1.RedisCacheService);
            return await useCase.execute(userId);
        });
    }
}
exports.DeleteUserAvatarTxService = DeleteUserAvatarTxService;
