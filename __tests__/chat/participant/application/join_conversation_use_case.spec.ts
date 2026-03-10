import { JoinConversationUseCase } from "../../../../src/modules/chat/application/participant/join_conversation_use_case";
import { ConversationNotFoundError } from "../../../../src/modules/chat/errors/conversation_errors/conversation_errors";
import {
    CannotJoinDirectConversationError,
    UserAlreadyParticipantError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { ConversationType } from "../../../../src/modules/chat/domain/conversation/conversation_type";

describe("JoinConversationUseCase", () => {

    let conversationRepo: any;
    let participantRepo: any;
    let mapper: any;
    let cacheService: any;

    let useCase: JoinConversationUseCase;

    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {

        conversationRepo = {
            findById: jest.fn()
        };

        participantRepo = {
            exists: jest.fn(),
            save: jest.fn()
        };

        mapper = {
            mapToParticipantDto: jest.fn()
        };

        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };

        useCase = new JoinConversationUseCase(
            conversationRepo,
            participantRepo,
            mapper,
            cacheService
        );
    });

    // =========================
    // conversation not found
    // =========================

    it("should throw if conversation does not exist", async () => {

        conversationRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)
        ).rejects.toBeInstanceOf(ConversationNotFoundError);

    });

    // =========================
    // direct conversation
    // =========================

    it("should throw if conversation is direct", async () => {

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.DIRECT
        });

        await expect(
            useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)
        ).rejects.toBeInstanceOf(CannotJoinDirectConversationError);

    });

    // =========================
    // already participant
    // =========================

    it("should throw if user already participant", async () => {

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.GROUP
        });

        participantRepo.exists.mockResolvedValue(true);

        await expect(
            useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)
        ).rejects.toBeInstanceOf(UserAlreadyParticipantError);

    });

    // =========================
    // happy path
    // =========================

    it("should join conversation successfully", async () => {

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.GROUP
        });

        participantRepo.exists.mockResolvedValue(false);

        mapper.mapToParticipantDto.mockReturnValue({
            userId: USER_ID
        });

        const result = await useCase.joinConversationUseCase(
            USER_ID,
            CONVERSATION_ID
        );

        expect(participantRepo.save).toHaveBeenCalled();

        expect(cacheService.del)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_ID}:*`);

        expect(result).toEqual({ userId: USER_ID });

    });

});