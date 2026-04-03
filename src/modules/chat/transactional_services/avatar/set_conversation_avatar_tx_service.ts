import { TransactionManagerInterface } from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import { AvatarRepositoryPg } from "../../repositories_pg_realization/avatar_repository_pg";
import { ConversationRepositoryPg } from "../../repositories_pg_realization/conversation_repository_pg";
import { ParticipantRepositoryPg } from "../../repositories_pg_realization/participant_repository_pg";
import { ImageProcessor } from "../../infrasctructure/image_processor/sharp_image_processor";
import { SetConversationAvatarUseCase } from "../../application/avatar/set_conversation_avatar_use_case";
import { RedisCacheService } from "../../../../container";
import { EncryptionPort } from "../../../infrasctructure/ports/encryption/encryption_port";

export class SetConversationAvatarTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}

    async setConversationAvatar(conversationId: string, userId: string, fileBuffer: Buffer): Promise<string> {
        return this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client, this.encryptionService);
            const participantRepo = new ParticipantRepositoryPg(client);
            const avatarRepo = new AvatarRepositoryPg(client);
            const imageProcessor = new ImageProcessor();

            const useCase = new SetConversationAvatarUseCase(
                conversationRepo,
                participantRepo,
                avatarRepo,
                imageProcessor,
                RedisCacheService
            );

            return await useCase.execute(conversationId, userId, fileBuffer);
        });
    }
}
