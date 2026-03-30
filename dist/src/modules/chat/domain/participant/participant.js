"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Participant = void 0;
const participant_role_1 = require("./participant_role");
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
class Participant {
    conversationId;
    userId;
    role;
    canSendMessages;
    mutedUntil;
    joinedAt;
    constructor(conversationId, userId, role, canSendMessages, mutedUntil, joinedAt) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.role = role;
        this.canSendMessages = canSendMessages;
        this.mutedUntil = mutedUntil;
        this.joinedAt = joinedAt;
    }
    static restore(conversationId, userId, role, canSendMessages, mutedUntil, joinedAt) {
        return new Participant(conversationId, userId, role, canSendMessages, mutedUntil, joinedAt);
    }
    static createAsMember(conversationId, userId) {
        return new Participant(conversationId, userId, participant_role_1.ParticipantRole.MEMBER, true, null, new Date());
    }
    static createAsOwner(conversationId, userId) {
        return new Participant(conversationId, userId, participant_role_1.ParticipantRole.OWNER, true, null, new Date());
    }
    canChangeRole(actor, target) {
        return (actor.getRole() === participant_role_1.ParticipantRole.OWNER &&
            actor.canSendMessages &&
            actor.getConversationId() === target.getConversationId() &&
            actor.userId !== target.userId &&
            target.role === participant_role_1.ParticipantRole.MEMBER);
    }
    mute(until) {
        this.canSendMessages = false;
        this.mutedUntil = until;
    }
    unmute() {
        this.canSendMessages = true;
        this.mutedUntil = null;
    }
    changeRole(actor, target) {
        if (!this.canChangeRole(actor, target)) {
            throw new participant_errors_1.InsufficientPermissionsError("Cannot change role of a participant");
        }
        this.setRole();
    }
    setRole() {
        this.role = this.role === participant_role_1.ParticipantRole.MEMBER ? participant_role_1.ParticipantRole.OWNER : participant_role_1.ParticipantRole.MEMBER;
    }
    canBanOther(other) {
        return (this.getRole() === participant_role_1.ParticipantRole.OWNER &&
            other.getRole() !== participant_role_1.ParticipantRole.OWNER &&
            this.getConversationId() === other.getConversationId() &&
            this.userId !== other.userId);
    }
    canUnban(targetId) {
        return (this.getRole() === participant_role_1.ParticipantRole.OWNER &&
            this.userId !== targetId);
    }
    getConversationId = () => this.conversationId;
    getRole = () => this.role;
    getCanSendMessages = () => this.canSendMessages;
    getMutedUntil = () => this.mutedUntil;
    getJoinedAt = () => this.joinedAt;
}
exports.Participant = Participant;
