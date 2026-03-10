import {ConversationType} from "./conversation_type";
import {ConversationTitle} from "./conversation_title";
import {
    DirectConversationTwoUsersError
} from "../../errors/conversation_errors/conversation_errors";

export class Conversation {
    constructor(
        public readonly id: string,
        private conversationType: ConversationType,
        private title: ConversationTitle,
        private createdBy: string,
        private createdAt: Date,
        private lastMessageAt: Date | null,
        private userLow: string | null,
        private userHigh: string | null,
    ) {
        if (conversationType === ConversationType.DIRECT && (!userLow || !userHigh)) {
            throw new DirectConversationTwoUsersError("Direct conversation must have two users!");
        }
    }

    static restore(
        id: string,
        conversationType: ConversationType,
        title: string,
        createdBy: string,
        createdAt: Date,
        lastMessageAt: Date | null,
        userLow: string | null,
        userHigh: string | null,
    ) {
        return new Conversation(
            id,
            conversationType,
            title === "" ? ConversationTitle.empty() : ConversationTitle.create(title),
            createdBy,
            createdAt,
            lastMessageAt,
            userLow,
            userHigh,
        );
    }

    static createDirect(
        createdBy: string,
        userA: string,
        userB: string,
    ) {

        const [userLow, userHigh] = userA < userB ? [userA, userB] : [userB, userA];

        return new Conversation(
            crypto.randomUUID(),
            ConversationType.DIRECT,
            ConversationTitle.empty(),
            createdBy,
            new Date(),
            null,
            userLow,
            userHigh,
        );
    }

    static createGroup(
        title: ConversationTitle,
        createdBy: string,
    ) {
        return new Conversation(
            crypto.randomUUID(),
            ConversationType.GROUP,
            title,
            createdBy,
            new Date(),
            null,
            null,
            null,
        );
    }

    updateTitle(newTitle: string) {
        if (this.conversationType === ConversationType.DIRECT) {
            throw new DirectConversationTwoUsersError("Direct conversation cannot have a title!");
        }
        const checkedTitle = ConversationTitle.create(newTitle);
        this.setTitle(checkedTitle);
    }

    updateLastMessageAt(date: Date) {
        this.setLastMessageAt(date);
    }

    private setTitle(title: ConversationTitle) {
        this.title = title;
    }

    private setLastMessageAt(date: Date) {
        this.lastMessageAt = date;
    }

    getConversationType = () => this.conversationType;
    getTitle = () => this.title;
    getCreatedBy = () => this.createdBy;
    getCreatedAt = () => this.createdAt;
    getLastMessageAt = () => this.lastMessageAt;
    getUserLow = () => this.userLow;
    getUserHigh = () => this.userHigh;
}

