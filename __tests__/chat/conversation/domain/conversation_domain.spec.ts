import { Conversation } from "../../../../src/modules/chat/domain/conversation/conversation";
import { ConversationType } from "../../../../src/modules/chat/domain/conversation/conversation_type";
import { ConversationTitle } from "../../../../src/modules/chat/domain/conversation/conversation_title";
import {
    CannotUpdateTitleError,
    DirectConversationTwoUsersError
} from "../../../../src/modules/chat/errors/conversation_errors/conversation_errors";

describe("Conversation Domain", () => {

    const USER_A = "11111111-1111-1111-1111-111111111111";
    const USER_B = "22222222-2222-2222-2222-222222222222";

    // =========================
    // createDirect
    // =========================

    it("should create direct conversation", () => {

        const conversation = Conversation.createDirect(
            USER_A,
            USER_A,
            USER_B
        );

        expect(conversation.getConversationType())
            .toBe(ConversationType.DIRECT);

        expect(conversation.getUserLow())
            .toBe(USER_A);

        expect(conversation.getUserHigh())
            .toBe(USER_B);

        expect(conversation.getLastMessageAt())
            .toBeNull();
    });

    it("should sort users in direct conversation", () => {

        const conversation = Conversation.createDirect(
            USER_A,
            USER_B,
            USER_A
        );

        expect(conversation.getUserLow())
            .toBe(USER_A);

        expect(conversation.getUserHigh())
            .toBe(USER_B);
    });

    // =========================
    // createGroup
    // =========================

    it("should create group conversation", () => {

        const title = ConversationTitle.create("Group Chat");

        const conversation = Conversation.createGroup(
            title,
            USER_A
        );

        expect(conversation.getConversationType())
            .toBe(ConversationType.GROUP);

        expect(conversation.getTitle().getValue())
            .toBe("Group Chat");

        expect(conversation.getUserLow())
            .toBeNull();

        expect(conversation.getUserHigh())
            .toBeNull();
    });

    // =========================
    // restore
    // =========================

    it("should restore direct conversation", () => {

        const now = new Date();

        const conversation = Conversation.restore(
            crypto.randomUUID(),
            ConversationType.DIRECT,
            "",
            USER_A,
            now,
            null,
            USER_A,
            USER_B
        );

        expect(conversation.getConversationType())
            .toBe(ConversationType.DIRECT);

        expect(conversation.getUserLow())
            .toBe(USER_A);

        expect(conversation.getUserHigh())
            .toBe(USER_B);
    });

    it("should restore group conversation", () => {

        const now = new Date();

        const conversation = Conversation.restore(
            crypto.randomUUID(),
            ConversationType.GROUP,
            "My Group",
            USER_A,
            now,
            null,
            null,
            null
        );

        expect(conversation.getTitle().getValue())
            .toBe("My Group");
    });

    // =========================
    // invariants
    // =========================

    it("should throw if direct conversation has no users", () => {

        expect(() =>
            Conversation.restore(
                crypto.randomUUID(),
                ConversationType.DIRECT,
                "",
                USER_A,
                new Date(),
                null,
                null,
                null
            )
        ).toThrow(DirectConversationTwoUsersError);

    });

    // =========================
    // updateTitle
    // =========================

    it("should update title for group conversation", () => {

        const conversation = Conversation.createGroup(
            ConversationTitle.create("Old Title"),
            USER_A
        );

        conversation.updateTitle("New Title");

        expect(conversation.getTitle().getValue())
            .toBe("New Title");
    });

    it("should throw when updating title for direct conversation", () => {

        const conversation = Conversation.createDirect(
            USER_A,
            USER_A,
            USER_B
        );

        expect(() =>
            conversation.updateTitle("New Title")
        ).toThrow(CannotUpdateTitleError);

    });

    // =========================
    // updateLastMessageAt
    // =========================

    it("should update last message date", () => {

        const conversation = Conversation.createDirect(
            USER_A,
            USER_A,
            USER_B
        );

        const date = new Date();

        conversation.updateLastMessageAt(date);

        expect(conversation.getLastMessageAt())
            .toEqual(date);
    });

});