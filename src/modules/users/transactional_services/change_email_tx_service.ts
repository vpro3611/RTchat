import {
    TransactionManagerInterface
} from "../../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {UserRepoReaderPg} from "../repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "../repositories/user_repo_writer_pg";
import {UserMapper} from "../shared/map_to_dto";
import {UserLookup} from "../shared/user_exists_by_id";
import {ChangeEmailUseCase} from "../application/change_email_use_case";
import {SendVerifEmailShared} from "../shared/send_verif_email_shared";
import {EmailSenderNodemailer} from "../../infrasctructure/ports/email_verif_infra/email_sender/email_sender";
import {
    EmailVerificationTokenRepoPg
} from "../../infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg";


export class ChangeEmailTxService {
    constructor(private readonly txManager: TransactionManagerInterface) {}

    async changeEmailTxService(actorId: string, newEmail: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);

            const mapper = new UserMapper();
            const userLookup = new UserLookup(userRepoReader);

            const emailSender = new EmailSenderNodemailer();
            const emailVerifRepo = new EmailVerificationTokenRepoPg(client);

            const sendVerifShared = new SendVerifEmailShared(emailSender, emailVerifRepo);

            const changeEmailUseCase = new ChangeEmailUseCase(
                userRepoReader,
                userRepoWriter,
                mapper,
                userLookup,
                sendVerifShared,
                emailVerifRepo
            );

            return await changeEmailUseCase.changeEmailUseCase(actorId, newEmail);
        })
    }
}