import { LeaveConversationUseCase } from "../../../../src/modules/chat/application/participant/leave_conversation_use_case";
import { ActorIsNotParticipantError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { Participant } from "../../../../src/modules/chat/domain/participant/participant";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";

describe("LeaveConversationUseCase", () => {

    let participantRepo: any;
    let cacheService: any;
    let useCase: LeaveConversationUseCase;

    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {
        participantRepo = {
            findParticipant: jest.fn(),
            getOwners: jest.fn(),
            getOldestParticipantNotOwner: jest.fn(),
            save: jest.fn(),
            remove: jest.fn()
        };

        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };

        useCase = new LeaveConversationUseCase(
            participantRepo,
            cacheService
        );
    });

    it("should throw if actor is not participant", async () => {
        participantRepo.findParticipant.mockResolvedValue(null);

        await expect(
            useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID)
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

        expect(participantRepo.remove).not.toHaveBeenCalled();
    });

    it("should allow a member to leave without ownership transfer", async () => {
        const member = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.MEMBER, true, null, new Date());
        participantRepo.findParticipant.mockResolvedValue(member);

        const result = await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(result).toBeNull();
        expect(participantRepo.remove).toHaveBeenCalledWith(CONVERSATION_ID, USER_ID);
        expect(participantRepo.getOwners).not.toHaveBeenCalled();
    });

    it("should allow an owner to leave without transfer if there are other owners", async () => {
        const owner1 = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.OWNER, true, null, new Date());
        const owner2 = Participant.restore(CONVERSATION_ID, "user-2", ParticipantRole.OWNER, true, null, new Date());
        
        participantRepo.findParticipant.mockResolvedValue(owner1);
        participantRepo.getOwners.mockResolvedValue([owner1, owner2]);

        const result = await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(result).toBeNull();
        expect(participantRepo.remove).toHaveBeenCalledWith(CONVERSATION_ID, USER_ID);
        expect(participantRepo.save).not.toHaveBeenCalled();
    });

    it("should transfer ownership to oldest member if last owner leaves", async () => {
        const owner = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.OWNER, true, null, new Date());
        const candidate = Participant.restore(CONVERSATION_ID, "user-2", ParticipantRole.MEMBER, true, null, new Date(Date.now() - 1000));
        
        participantRepo.findParticipant.mockResolvedValue(owner);
        participantRepo.getOwners.mockResolvedValue([owner]);
        participantRepo.getOldestParticipantNotOwner.mockResolvedValue(candidate);

        const result = await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(result).toBe("user-2");
        expect(candidate.getRole()).toBe(ParticipantRole.OWNER);
        expect(participantRepo.save).toHaveBeenCalledWith(candidate);
        expect(participantRepo.remove).toHaveBeenCalledWith(CONVERSATION_ID, USER_ID);
    });

    it("should transfer ownership even if owner is muted", async () => {
        const mutedOwner = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.OWNER, false, new Date(Date.now() + 10000), new Date());
        const candidate = Participant.restore(CONVERSATION_ID, "user-2", ParticipantRole.MEMBER, true, null, new Date(Date.now() - 1000));
        
        participantRepo.findParticipant.mockResolvedValue(mutedOwner);
        participantRepo.getOwners.mockResolvedValue([mutedOwner]);
        participantRepo.getOldestParticipantNotOwner.mockResolvedValue(candidate);

        const result = await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(result).toBe("user-2");
        expect(candidate.getRole()).toBe(ParticipantRole.OWNER);
        expect(participantRepo.save).toHaveBeenCalledWith(candidate);
    });

    it("should transfer ownership to a muted candidate if they are the oldest", async () => {
        const owner = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.OWNER, true, null, new Date());
        const mutedCandidate = Participant.restore(CONVERSATION_ID, "user-2", ParticipantRole.MEMBER, false, new Date(Date.now() + 10000), new Date(Date.now() - 1000));
        
        participantRepo.findParticipant.mockResolvedValue(owner);
        participantRepo.getOwners.mockResolvedValue([owner]);
        participantRepo.getOldestParticipantNotOwner.mockResolvedValue(mutedCandidate);

        const result = await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(result).toBe("user-2");
        expect(mutedCandidate.getRole()).toBe(ParticipantRole.OWNER);
        expect(participantRepo.save).toHaveBeenCalledWith(mutedCandidate);
    });

    it("should not transfer if no candidate exists", async () => {
        const owner = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.OWNER, true, null, new Date());
        
        participantRepo.findParticipant.mockResolvedValue(owner);
        participantRepo.getOwners.mockResolvedValue([owner]);
        participantRepo.getOldestParticipantNotOwner.mockResolvedValue(null);

        const result = await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(result).toBeNull();
        expect(participantRepo.remove).toHaveBeenCalledWith(CONVERSATION_ID, USER_ID);
        expect(participantRepo.save).not.toHaveBeenCalled();
    });

    it("should invalidate caches after leaving", async () => {
        const member = Participant.restore(CONVERSATION_ID, USER_ID, ParticipantRole.MEMBER, true, null, new Date());
        participantRepo.findParticipant.mockResolvedValue(member);

        await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);

        expect(cacheService.del).toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`conv:user:${USER_ID}:*`);
    });
});