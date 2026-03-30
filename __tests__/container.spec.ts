import { assembleContainer } from "../src/container";
import { Server } from "socket.io";

describe("DI Container", () => {
    it("should have resendMessageController registered", () => {
        const mockIo = {} as Server;
        const container = assembleContainer(mockIo);
        
        expect(container).toHaveProperty("resendMessageController");
    });
});
