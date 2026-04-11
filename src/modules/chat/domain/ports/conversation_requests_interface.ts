import {ConversationRequests} from "../conversation_requests/conversation_requests";


export interface ConversationRequestsInterface {
    create(convReq: ConversationRequests): Promise<void>;
    getRequests(conversationId: string, status?: string): Promise<ConversationRequests[]>;
    getSpecificRequest(requestId: string, conversationId: string): Promise<ConversationRequests | null>;
    getRequestById(requestId: string): Promise<ConversationRequests | null>;
    getUsersRequests(userId: string, status?: string): Promise<ConversationRequests[]>;
    updateRequest(requestId: string, conversationId: string, status: string, reviewMessage: string): Promise<ConversationRequests>;
    removeRequest(requestId: string): Promise<void>;
    expireRequests(): Promise<number>;
}