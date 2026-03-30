import {SavedMessages} from "../saved_messages/saved_messages";


export interface SavedMessagesRepoInterface {
    saveMessage(savedMessage: SavedMessages): Promise<void>;
    getSavedMessages(savedById: string, limit?: number, cursor?: string): Promise<{items: SavedMessages[], nextCursor?: string }>;
    getSpecificSavedMessage(messageId: string, savedById: string): Promise<SavedMessages | null>;
    removeSavedMessage(messageId: string, savedById: string): Promise<void>;
    isSaved(messageId: string, savedById: string): Promise<boolean>;
}