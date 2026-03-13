import { Participant } from "../../../../src/modules/chat/domain/participant/participant";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";
import { InsufficientPermissionsError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { calculateMuteUntil } from "../../../../src/modules/chat/domain/participant/calculate_mute_until";
import { MuteDuration } from "../../../../src/modules/chat/domain/participant/mute_duration";

describe("Participant Domain", () => {

    const CONVERSATION_ID = "conv-1";
    const USER_A = "user-a";
    const USER_B = "user-b";

    // =========================
    // create
    // =========================

    it("should create member participant", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_A
        );

        expect(participant.getRole())
            .toBe(ParticipantRole.MEMBER);

        expect(participant.getCanSendMessages())
            .toBe(true);

        expect(participant.getMutedUntil())
            .toBeNull();
    });

    it("should create owner participant", () => {

        const participant = Participant.createAsOwner(
            CONVERSATION_ID,
            USER_A
        );

        expect(participant.getRole())
            .toBe(ParticipantRole.OWNER);
    });

    // =========================
    // restore
    // =========================

    it("should restore participant", () => {

        const date = new Date();

        const participant = Participant.restore(
            CONVERSATION_ID,
            USER_A,
            ParticipantRole.MEMBER,
            true,
            null,
            date
        );

        expect(participant.getConversationId())
            .toBe(CONVERSATION_ID);

        expect(participant.getJoinedAt())
            .toEqual(date);
    });

    // =========================
    // mute
    // =========================

    it("should mute participant", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_A
        );

        const until = new Date(Date.now() + 3600000);

        participant.mute(until);

        expect(participant.getCanSendMessages())
            .toBe(false);

        expect(participant.getMutedUntil())
            .toEqual(until);
    });

    it("should unmute participant", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_A
        );

        participant.mute(new Date());
        participant.unmute();

        expect(participant.getCanSendMessages())
            .toBe(true);

        expect(participant.getMutedUntil())
            .toBeNull();
    });

    // =========================
    // change role
    // =========================

    it("should allow owner to change role of member", () => {

        const owner = Participant.createAsOwner(
            CONVERSATION_ID,
            USER_A
        );

        const member = Participant.createAsMember(
            CONVERSATION_ID,
            USER_B
        );

        member.changeRole(owner, member);

        expect(member.getRole())
            .toBe(ParticipantRole.OWNER);
    });

    it("should throw if non-owner tries to change role", () => {

        const memberA = Participant.createAsMember(
            CONVERSATION_ID,
            USER_A
        );

        const memberB = Participant.createAsMember(
            CONVERSATION_ID,
            USER_B
        );

        expect(() =>
            memberB.changeRole(memberA, memberB)
        ).toThrow(InsufficientPermissionsError);

    });

    it("should throw if actor tries to change own role", () => {

        const owner = Participant.createAsOwner(
            CONVERSATION_ID,
            USER_A
        );

        expect(() =>
            owner.changeRole(owner, owner)
        ).toThrow(InsufficientPermissionsError);

    });

});


describe("Participant mute behaviour", () => {

    const CONVERSATION_ID = "conv-1";
    const USER_ID = "user-1";

    it("should mute participant until specific date", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_ID
        );

        const until = new Date(Date.now() + 3600000);

        participant.mute(until);

        expect(participant.getCanSendMessages())
            .toBe(false);

        expect(participant.getMutedUntil())
            .toEqual(until);
    });

    it("should mute participant forever when null passed", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_ID
        );

        participant.mute(null);

        expect(participant.getCanSendMessages())
            .toBe(false);

        expect(participant.getMutedUntil())
            .toBeNull();
    });

    it("should overwrite previous mute when muting again", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_ID
        );

        const firstMute = new Date(Date.now() + 1000);
        const secondMute = new Date(Date.now() + 2000);

        participant.mute(firstMute);
        participant.mute(secondMute);

        expect(participant.getMutedUntil())
            .toEqual(secondMute);
        expect(participant.getCanSendMessages()).toBe(false);
    });

    it("should allow sending messages again after unmute", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_ID
        );

        participant.mute(new Date());
        participant.unmute();

        expect(participant.getCanSendMessages())
            .toBe(true);

        expect(participant.getMutedUntil())
            .toBeNull();
    });

    it("mute should not change participant role", () => {

        const participant = Participant.createAsOwner(
            CONVERSATION_ID,
            USER_ID
        );

        participant.mute(new Date());

        expect(participant.getRole())
            .toBe(ParticipantRole.OWNER);
    });

    it("mute should not change conversation id", () => {

        const participant = Participant.createAsMember(
            CONVERSATION_ID,
            USER_ID
        );

        participant.mute(new Date());

        expect(participant.getConversationId())
            .toBe(CONVERSATION_ID);
    });

});

