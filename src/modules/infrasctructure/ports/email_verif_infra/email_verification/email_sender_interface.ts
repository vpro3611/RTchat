
export interface EmailSenderInterface {
    sendVerificationEmail(
        email: string,
        token: string,
        path: string,
        flowType: "register" | "change"
    ): Promise<void>;
}