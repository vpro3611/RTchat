import { assembleContainer } from "../src/container";
import { Server } from "socket.io";

describe("DI Container", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            FRONTEND_URL: "http://localhost:9000",
            API_URL: "http://localhost:3000",
            APP_NAME: "RTChat",
            MESSAGE_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("should have resendMessageController registered", () => {
        const mockIo = {} as Server;
        const container = assembleContainer(mockIo);

        expect(container).toHaveProperty("resendMessageController");
    });
});
