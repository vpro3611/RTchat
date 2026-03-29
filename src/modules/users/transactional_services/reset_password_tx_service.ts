import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";
import {EmailSenderNodemailer} from "../../infrasctructure/ports/email_verif_infra/email_sender/email_sender";
import {
    EmailVerificationTokenRepoPg
} from "../../infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg";
import {UserMapper} from "../shared/map_to_dto";
import {Bcrypter} from "../../infrasctructure/ports/bcrypter/bcrypter";
import {RestoreForgottenPasswordUseCase} from "../application/restore_forgotten_password_use_case";


export class ResetPasswordTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}


    async resetPasswordTxService(email: string, newPassword: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoWriter = new UserRepoWriterPg(client);
            const userRepoReader = new UserRepoReaderPg(client);

            const userMapper = new UserMapper();

            const emailSender = new EmailSenderNodemailer();
            const emailVerifRepo = new EmailVerificationTokenRepoPg(client);

            const bcrypter = new Bcrypter();

            const sendEmailVerifShared = new SendVerifEmailShared(
                emailSender,
                emailVerifRepo
            );

            const resetPasswordUseCase = new RestoreForgottenPasswordUseCase(
                userRepoWriter,
                userRepoReader,
                sendEmailVerifShared,
                userMapper,
                bcrypter,
                emailVerifRepo
            );

            return await resetPasswordUseCase
                .restoreForgottenPasswordUseCase(email, newPassword);
        })
    }
}