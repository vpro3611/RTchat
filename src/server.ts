import {assembleContainer} from "./container";
import {createApp} from "./app";
import {ChatGateway} from "./modules/chat/web_socket/chat_gateway";
import * as http from "node:http";


export async function startServer() {
    const dependencies = assembleContainer();
    const app = createApp(dependencies);

    const server = http.createServer(app);

    const port = process.env.PORT || 3000;

    new ChatGateway(
        server,
        dependencies.jwtTokenService,
        dependencies.sendMessageService,
        dependencies.editMessageService,
        dependencies.deleteMessageService,
        dependencies.getUserConversationsService,
        dependencies.markConversationReadService,
    )

    server.listen(port, () => {
        console.log(`Server is running on port ${port}! Happy developing!`);
    });
}