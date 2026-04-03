import { TransactionManagerInterface } from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import { AvatarRepositoryPg } from "../../repositories_pg_realization/avatar_repository_pg";
import { UserRepoReaderPg } from "../../../users/repositories/user_repo_reader_pg";
import { UserRepoWriterPg } from "../../../users/repositories/user_repo_writer_pg";
import { DeleteUserAvatarUseCase } from "../../application/avatar/delete_user_avatar_use_case";
import { RedisCacheService } from "../../../../container";
import { EncryptionPort } from "../../../infrasctructure/ports/encryption/encryption_port";

export class DeleteUserAvatarTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async deleteUserAvatar(userId: string): Promise<void> {
        return this.txManager.runInTransaction(async (client) => {
            const userReader = new UserRepoReaderPg(client);
            const userWriter = new UserRepoWriterPg(client);
            const avatarRepo = new AvatarRepositoryPg(client);

            const useCase = new DeleteUserAvatarUseCase(
                userReader,
                userWriter,
                avatarRepo,
                RedisCacheService
            );

            return await useCase.execute(userId);
        });
    }
}
