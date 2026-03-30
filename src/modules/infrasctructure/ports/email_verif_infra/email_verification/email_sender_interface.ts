import {FlowType} from "../email_sender/email_sender";

export interface EmailSenderInterface {
    sendVerificationEmail(
        email: string,
        token: string,
        path: string,
        flowType: FlowType,
    ): Promise<void>;
}