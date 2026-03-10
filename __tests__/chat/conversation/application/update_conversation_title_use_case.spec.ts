import { UpdateConversationTitleUseCase } from "../../../../src/modules/chat/application/conversation/update_conversation_title_use_case";
import { ConversationType } from "../../../../src/modules/chat/domain/conversation/conversation_type";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";
import {
    CannotUpdateTitleError,
    ConversationNotFoundError
} from "../../../../src/modules/chat/errors/conversation_errors/conversation_errors";

describe("UpdateConversationTitleUseCase", () => {

    let conversationRepo: any;
    let checkIsParticipant: any;
    let mapper: any;
    let cacheService: any;
    let participantRepo: any;

    let useCase: UpdateConversationTitleUseCase;

    const ACTOR_ID = "user-1";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {

        conversationRepo = {
            findById: jest.fn(),
            update: jest.fn()
        };

        checkIsParticipant = {
            checkIsParticipant: jest.fn()
        };

        mapper = {
            mapToConversationDto: jest.fn()
        };

        cacheService = {
            delByPattern: jest.fn()
        };

        participantRepo = {
            getParticipants: jest.fn()
        };

        useCase = new UpdateConversationTitleUseCase(
            conversationRepo,
            checkIsParticipant,
            mapper,
            cacheService,
            participantRepo
        );
    });

    // =========================
    // conversation not found
    // =========================

    it("should throw if conversation does not exist", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({});

        conversationRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.updateConversationTitleUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                "new title"
            )
        ).rejects.toBeInstanceOf(ConversationNotFoundError);

    });

    // =========================
    // direct conversation
    // =========================

    it("should throw if conversation is direct", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getRole: () => ParticipantRole.OWNER,
            getCanSendMessages: () => true
        });

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.DIRECT
        });

        await expect(
            useCase.updateConversationTitleUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                "new title"
            )
        ).rejects.toBeInstanceOf(CannotUpdateTitleError);

    });

    // =========================
    // not owner
    // =========================

    it("should throw if actor is not owner", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getRole: () => ParticipantRole.MEMBER,
            getCanSendMessages: () => true
        });

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.GROUP
        });

        await expect(
            useCase.updateConversationTitleUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                "new title"
            )
        ).rejects.toBeInstanceOf(CannotUpdateTitleError);

    });

    // =========================
    // cannot send messages
    // =========================

    it("should throw if participant cannot send messages", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getRole: () => ParticipantRole.OWNER,
            getCanSendMessages: () => false
        });

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.GROUP
        });

        await expect(
            useCase.updateConversationTitleUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                "new title"
            )
        ).rejects.toBeInstanceOf(CannotUpdateTitleError);

    });

    // =========================
    // happy path
    // =========================

    it("should update conversation title", async () => {

        const conversation = {
            getConversationType: () => ConversationType.GROUP,
            updateTitle: jest.fn()
        };

        const participant = {
            getRole: () => ParticipantRole.OWNER,
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        conversationRepo.findById.mockResolvedValue(conversation);

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: "user-1" },
                { userId: "user-2" }
            ]
        });

        mapper.mapToConversationDto.mockReturnValue({ id: "conv1" });

        const result = await useCase.updateConversationTitleUseCase(
            ACTOR_ID,
            CONVERSATION_ID,
            "new title"
        );

        expect(conversation.updateTitle).toHaveBeenCalledWith("new title");

        expect(conversationRepo.update).toHaveBeenCalledWith(conversation);

        expect(cacheService.delByPattern).toHaveBeenCalledTimes(2);

        expect(result).toEqual({ id: "conv1" });

    });

});