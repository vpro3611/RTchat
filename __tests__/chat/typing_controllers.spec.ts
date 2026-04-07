import { StartTypingController } from "../../src/modules/chat/web_socket_controllers/typing_controllers/start_typing_controller";
import { StopTypingController } from "../../src/modules/chat/web_socket_controllers/typing_controllers/stop_typing_controller";

describe("Typing Controllers", () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    const socket = { data: { userId: { sub: "user-1" } } };

    it("StartTypingController should emit typing:start", async () => {
        const controller = new StartTypingController();
        await controller.startTypingController(socket as any, "conv-1", io as any);
        expect(io.to).toHaveBeenCalledWith("conv-1");
        expect(io.emit).toHaveBeenCalledWith("typing:start", { userId: "user-1", conversationId: "conv-1" });
    });

    it("StopTypingController should emit typing:stop", async () => {
        const controller = new StopTypingController();
        await controller.stopTypingController(socket as any, "conv-1", io as any);
        expect(io.to).toHaveBeenCalledWith("conv-1");
        expect(io.emit).toHaveBeenCalledWith("typing:stop", { userId: "user-1", conversationId: "conv-1" });
    });
});
