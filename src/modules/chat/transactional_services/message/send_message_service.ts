import {
    TransactionManagerInterface
} from "../../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {EncryptionPort} from "../../../infrasctructure/ports/encryption/encryption_port";
import {MessageRepositoryPg} from "../../repositories_pg_realization/message_repository_pg";
import {ConversationRepositoryPg} from "../../repositories_pg_realization/conversation_repository_pg";
import {MapToMessage} from "../../shared/map_to_message";
import {ParticipantRepositoryPg} from "../../repositories_pg_realization/participant_repository_pg";
import {CheckIsParticipant} from "../../shared/is_participant";
import {SendMessageUseCase} from "../../application/message/send_message_use_case";
import {RedisCacheService} from "../../../../container";
import {UserToUserBlocksPg} from "../../../users/repositories/user_to_user_blocks_pg";
import {ConversationBansRepositoryPg} from "../../repositories_pg_realization/conversation_bans_repository_pg";
import {FileDTO} from "../../DTO/file_dto";
import {ClamAVScanner} from "../../infrasctructure/virus_scanner/clamav_scanner";
import {VideoProcessor} from "../../infrasctructure/video_processor/ffmpeg_processor";
import {ImageProcessor} from "../../infrasctructure/image_processor/sharp_image_processor";
import {BlobRepositoryPg} from "../../repositories_pg_realization/blob_repository_pg";


export class SendMessageTxService {
    constructor(
        private readonly txManager: TransactionManagerInterface,
        private readonly encryptionService: EncryptionPort
    ) {}


    async sendMessageTxService(actorId: string, conversationId: string, content: string, files: FileDTO[] = []) {
        return await this.txManager.runInTransaction(async (client) => {
            const messageRepo = new MessageRepositoryPg(client, this.encryptionService);
            const conversationRepo = new ConversationRepositoryPg(client, this.encryptionService);
            const messageMapper = new MapToMessage();
            const participantRepo = new ParticipantRepositoryPg(client);
            const checkIsParticipant = new CheckIsParticipant(participantRepo);
            const userToUserBansRepo = new UserToUserBlocksPg(client);
            const conversationBansRepo = new ConversationBansRepositoryPg(client);

            const virusScanner = new ClamAVScanner();
            const videoProcessor = new VideoProcessor();
            const imageProcessor = new ImageProcessor();
            const blobRepo = new BlobRepositoryPg(client, this.encryptionService);

            const sendMessageUseCase = new SendMessageUseCase(
                messageRepo,
                conversationRepo,
                messageMapper,
                checkIsParticipant,
                RedisCacheService,
                participantRepo,
                userToUserBansRepo,
                conversationBansRepo,
                virusScanner,
                videoProcessor,
                imageProcessor,
                blobRepo,
            );

            return await sendMessageUseCase.sendMessageUseCase(actorId, conversationId, content, files);
        })
    }
}