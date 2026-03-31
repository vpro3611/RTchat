import {assembleContainer} from "./container";
import {createApp} from "./app";
import {ChatGateway} from "./modules/chat/web_socket/chat_gateway";
import * as http from "node:http";
import {TokenServiceJWT} from "./modules/authentification/jwt_token_service/token_service";


export async function startServer() {
    const jwtService = new TokenServiceJWT();
    
    const server = http.createServer();
    
    // 1. Создаем гейтвей с заглушками (они будут заменены через секунду)
    const gateway = new ChatGateway(
        server,
        jwtService,
        null as any,
        null as any,
        null as any,
        null as any,
        null as any,
        null as any,
        null as any
    );

    // 2. Теперь когда у нас есть io, собираем контейнер
    const dependencies = assembleContainer(gateway.getIo());
    
    // 3. Обновляем контроллеры в гейтвее
    gateway.updateControllers(
        dependencies.sendMessageController,
        dependencies.editMessageController,
        dependencies.deleteMessageController,
        dependencies.readMessageController,
        dependencies.getUserConversationsService,
        dependencies.startTypingController,
        dependencies.stopTypingController
    );

    const app = createApp(dependencies);
    server.on('request', app);

    const port = process.env.PORT || 3000;

    server.listen(port, () => {
        console.log(`Server is running on port ${port}! Happy developing!`);
    });
}