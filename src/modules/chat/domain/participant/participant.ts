import {ParticipantRole} from "./participant_role";

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
            actor.canSendMessages &&
            actor.getConversationId() === target.conversationId &&
            actor.userId !== target.userId &&
            target.role === ParticipantRole.MEMBER
        );
    }

    changeRole(actor: Participant, target: Participant) {
        if (!this.canChangeRole(actor, target)) {
            throw new Error("Only the owner can promote a member to owner");
        }
        this.setRole();
    }

    private setRole() {
        this.role = this.role === ParticipantRole.MEMBER ? ParticipantRole.OWNER : ParticipantRole.MEMBER;
    }

    getConversationId = () => this.conversationId;
    getRole = () => this.role;
    getCanSendMessages = () => this.canSendMessages;
    getMutedUntil = () => this.mutedUntil;
    getJoinedAt = () => this.joinedAt;
}