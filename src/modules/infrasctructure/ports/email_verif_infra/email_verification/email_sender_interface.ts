
export interface EmailSenderInterface {
    sendVerificationEmail(email: string, token: string): Promise<void>;
}