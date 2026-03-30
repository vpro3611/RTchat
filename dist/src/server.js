"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const container_1 = require("./container");
const app_1 = require("./app");
const chat_gateway_1 = require("./modules/chat/web_socket/chat_gateway");
const http = __importStar(require("node:http"));
async function startServer() {
    const dependencies = (0, container_1.assembleContainer)();
    const app = (0, app_1.createApp)(dependencies);
    const server = http.createServer(app);
    const port = process.env.PORT || 3000;
    new chat_gateway_1.ChatGateway(server, dependencies.jwtTokenService, dependencies.sendMessageController, dependencies.editMessageController, dependencies.deleteMessageController, dependencies.readMessageController, dependencies.getUserConversationsService, dependencies.startTypingController, dependencies.stopTypingController);
    server.listen(port, () => {
        console.log(`Server is running on port ${port}! Happy developing!`);
    });
}
