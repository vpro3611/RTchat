import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserMapper} from "../shared/map_to_dto";
import {EmailSenderNodemailer} from "../../infrasctructure/ports/email_verif_infra/email_sender/email_sender";
import {
    EmailVerificationTokenRepoPg
} from "../../infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";
import {ResetUserStatusToTrueUseCase} from "../application/reset_user_status_to_true_use_case";


export class ResetUserStatusToTrueTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async resetUserStatusToTrueTxService(email: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoWriter = new UserRepoWriterPg(client);
            const userRepoReader = new UserRepoReaderPg(client);
            const userMapper = new UserMapper();

            const emailSender = new EmailSenderNodemailer();
            const emailVerifRepo = new EmailVerificationTokenRepoPg(client);

            const sendEmailVerifShared = new SendVerifEmailShared(
                emailSender,
                emailVerifRepo
            );

            const resetUserStatusToTrueUseCase = new ResetUserStatusToTrueUseCase(
                userRepoWriter,
                userRepoReader,
                userMapper,
                sendEmailVerifShared,
                emailVerifRepo
            );

            return await resetUserStatusToTrueUseCase
                .resetUserStatusUseCase(email);
        })
    }
}