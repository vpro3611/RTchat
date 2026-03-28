import { TransactionManagerInterface } from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import { AvatarRepositoryPg } from "../../repositories_pg_realization/avatar_repository_pg";
import { ConversationRepositoryPg } from "../../repositories_pg_realization/conversation_repository_pg";
import { ParticipantRepositoryPg } from "../../repositories_pg_realization/participant_repository_pg";
import { DeleteConversationAvatarUseCase } from "../../application/avatar/delete_conversation_avatar_use_case";

export class DeleteConversationAvatarTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async deleteConversationAvatar(conversationId: string, userId: string): Promise<void> {
        return this.txManager.runInTransaction(async (client) => {
            const conversationRepo = new ConversationRepositoryPg(client);
            const participantRepo = new ParticipantRepositoryPg(client);
            const avatarRepo = new AvatarRepositoryPg(client);

            const useCase = new DeleteConversationAvatarUseCase(
                conversationRepo,
                participantRepo,
                avatarRepo
            );

            return await useCase.execute(conversationId, userId);
        });
    }
}
