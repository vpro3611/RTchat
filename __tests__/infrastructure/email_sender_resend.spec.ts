const mockSend = jest.fn();
const mockResendConstructor = jest.fn().mockImplementation(() => ({
    emails: {
        send: mockSend,
    },
}));

jest.mock("resend", () => ({
    Resend: mockResendConstructor,
}), {virtual: true});

import {EmailSendError} from "../../src/modules/infrasctructure/ports/email_verif_infra/errors/email_send_errors";
import {EmailSenderResend} from "../../src/modules/infrasctructure/ports/email_verif_infra/email_sender/email_sender";

describe("EmailSenderResend", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            RESEND_API_KEY: "re_test_key",
            RESEND_FROM_EMAIL: "noreply@example.com",
            APP_NAME: "RTChat",
            API_URL: "http://localhost:3000",
            NODE_ENV: "test",
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("sends the same verification email content via Resend", async () => {
        mockSend.mockResolvedValue({data: {id: "email-id"}, error: null});

        const sender = new EmailSenderResend();

        await sender.sendVerificationEmail(
            "user@example.com",
            "plain-token",
            "/public/verify-email",
            "register"
        );

        expect(mockResendConstructor).toHaveBeenCalledWith("re_test_key");
        expect(mockSend).toHaveBeenCalledWith({
            from: "\"RTChat\" <noreply@example.com>",
            to: "user@example.com",
            subject: "Verify your email",
            html: expect.stringContaining("http://localhost:3000/public/verify-email?token=plain-token&type=register"),
        });
    });

    it("wraps resend api errors in EmailSendError", async () => {
        mockSend.mockResolvedValue({
            data: null,
            error: {message: "provider exploded"},
        });

        const sender = new EmailSenderResend();

        await expect(
            sender.sendVerificationEmail(
                "user@example.com",
                "plain-token",
                "/public/verify-email",
                "register"
            )
        ).rejects.toThrow(new EmailSendError("provider exploded - FAILED TO SEND EMAIL"));
    });
});
