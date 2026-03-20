
export interface EmailSenderInterface {
    sendVerificationEmail(email: string, token: string, path: string): Promise<void>;
}