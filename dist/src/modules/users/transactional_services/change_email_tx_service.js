"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeEmailTxService = void 0;
const user_repo_reader_pg_1 = require("../repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("../repositories/user_repo_writer_pg");
const map_to_dto_1 = require("../shared/map_to_dto");
const user_exists_by_id_1 = require("../shared/user_exists_by_id");
const change_email_use_case_1 = require("../application/change_email_use_case");
const send_verif_email_shared_1 = require("../shared/send_verif_email_shared");
const email_sender_1 = require("../../infrasctructure/ports/email_verif_infra/email_sender/email_sender");
const email_verification_token_repo_pg_1 = require("../../infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg");
class ChangeEmailTxService {
    txManager;
    constructor(txManager) {
        this.txManager = txManager;
    }
    async changeEmailTxService(actorId, newEmail) {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userRepoWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const mapper = new map_to_dto_1.UserMapper();
            const userLookup = new user_exists_by_id_1.UserLookup(userRepoReader);
            const emailSender = new email_sender_1.EmailSenderNodemailer();
            const emailVerifRepo = new email_verification_token_repo_pg_1.EmailVerificationTokenRepoPg(client);
            const sendVerifShared = new send_verif_email_shared_1.SendVerifEmailShared(emailSender, emailVerifRepo);
            const changeEmailUseCase = new change_email_use_case_1.ChangeEmailUseCase(userRepoReader, userRepoWriter, mapper, userLookup, sendVerifShared);
            return await changeEmailUseCase.changeEmailUseCase(actorId, newEmail);
        });
    }
}
exports.ChangeEmailTxService = ChangeEmailTxService;
