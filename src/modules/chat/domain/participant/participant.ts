import {ParticipantRole} from "./participant_role";
import {InsufficientPermissionsError} from "../../errors/participants_errors/participant_errors";

export class Participant {
    constructor(
        private readonly conversationId: string,
        readonly userId: string,
        private role: ParticipantRole,
        private canSendMessages: boolean,
        private mutedUntil: Date | null,
        private readonly joinedAt: Date,
    ) {}

    static restore(
        conversationId: string,
        userId: string,
        role: ParticipantRole,
        canSendMessages: boolean,
        mutedUntil: Date | null,
        joinedAt: Date,
    ) {
        return new Participant(
            conversationId,
            userId,
            role,
            canSendMessages,
            mutedUntil,
            joinedAt
        );
    }

    static createAsMember(
        conversationId: string,
        userId: string,
    ) {
        return new Participant(
            conversationId,
            userId,
            ParticipantRole.MEMBER,
            true,
            null,
            new Date(),
        )
    }

    static createAsOwner(
        conversationId: string,
        userId: string,
    ) {
        return new Participant(
            conversationId,
            userId,
            ParticipantRole.OWNER,
            true,
            null,
            new Date(),
        )
    }

    private canChangeRole(actor: Participant, target: Participant) {
        return (
            actor.getRole() === ParticipantRole.OWNER &&
            actor.getConversationId() === target.getConversationId() &&
            actor.userId !== target.userId &&
            target.role === ParticipantRole.MEMBER
        );
    }

    mute(until: Date | null) {
        this.canSendMessages = false;
        this.mutedUntil = until;
    }

    unmute() {
        this.canSendMessages = true;
        this.mutedUntil = null;
    }

    changeRole(actor: Participant, target: Participant) {
        if (!this.canChangeRole(actor, target)) {
            throw new InsufficientPermissionsError("Cannot change role of a participant");
        }
        this.setRole();
    }

    private setRole() {
        this.role = this.role === ParticipantRole.MEMBER ? ParticipantRole.OWNER : ParticipantRole.MEMBER;
    }

    canBanOther(other: Participant) {
        return (
            this.getRole() === ParticipantRole.OWNER &&
            other.getRole() !== ParticipantRole.OWNER &&
            this.getConversationId() === other.getConversationId() &&
            this.userId !== other.userId
        );
    }

    canUnban(targetId: string) {
        return (
            this.getRole() === ParticipantRole.OWNER &&
            this.userId !== targetId
        );
    }

    getConversationId = () => this.conversationId;
    getRole = () => this.role;
    getCanSendMessages = () => this.canSendMessages;
    getMutedUntil = () => this.mutedUntil;
    getJoinedAt = () => this.joinedAt;
}