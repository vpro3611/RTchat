"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUserAvatarTxService = void 0;
const avatar_repository_pg_1 = require("../../repositories_pg_realization/avatar_repository_pg");
const user_repo_reader_pg_1 = require("../../../users/repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("../../../users/repositories/user_repo_writer_pg");
const sharp_image_processor_1 = require("../../infrasctructure/image_processor/sharp_image_processor");
const set_user_avatar_use_case_1 = require("../../application/avatar/set_user_avatar_use_case");
const container_1 = require("../../../../container");
class SetUserAvatarTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async setUserAvatar(userId, fileBuffer) {
        return this.txManager.runInTransaction(async (client) => {
            const userReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const avatarRepo = new avatar_repository_pg_1.AvatarRepositoryPg(client);
            const imageProcessor = new sharp_image_processor_1.ImageProcessor();
            const useCase = new set_user_avatar_use_case_1.SetUserAvatarUseCase(userReader, userWriter, avatarRepo, imageProcessor, container_1.RedisCacheService);
            return await useCase.execute(userId, fileBuffer);
        });
    }
}
exports.SetUserAvatarTxService = SetUserAvatarTxService;
