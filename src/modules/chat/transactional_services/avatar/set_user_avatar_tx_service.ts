import { TransactionManagerInterface } from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import { AvatarRepositoryPg } from "../../repositories_pg_realization/avatar_repository_pg";
import { UserRepoReaderPg } from "../../../users/repositories/user_repo_reader_pg";
import { UserRepoWriterPg } from "../../../users/repositories/user_repo_writer_pg";
import { ImageProcessor } from "../../infrasctructure/image_processor/sharp_image_processor";
import { SetUserAvatarUseCase } from "../../application/avatar/set_user_avatar_use_case";

export class SetUserAvatarTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async setUserAvatar(userId: string, fileBuffer: Buffer): Promise<string> {
        return this.txManager.runInTransaction(async (client) => {
            const userReader = new UserRepoReaderPg(client);
            const userWriter = new UserRepoWriterPg(client);
            const avatarRepo = new AvatarRepositoryPg(client);
            const imageProcessor = new ImageProcessor();

            const useCase = new SetUserAvatarUseCase(
                userReader,
                userWriter,
                avatarRepo,
                imageProcessor
            );

            return await useCase.execute(userId, fileBuffer);
        });
    }
}
