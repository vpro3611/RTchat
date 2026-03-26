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
    let cacheService: any;
    let conversationBansRepo: any;
    let conversationRequestsRepo: any;
    let requestMapper: any;

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

        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };

        conversationBansRepo = {
            isBanned: jest.fn()
        };

        conversationRequestsRepo = {
            create: jest.fn()
        };

        requestMapper = {
            mapToRequestDto: jest.fn()
        };

        useCase = new JoinConversationUseCase(
            conversationRepo,
            participantRepo,
            cacheService,
            conversationBansRepo,
            conversationRequestsRepo,
            requestMapper
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

        conversationBansRepo.isBanned.mockResolvedValue(false);

        participantRepo.exists.mockResolvedValue(true);

        await expect(
            useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)
        ).rejects.toBeInstanceOf(UserAlreadyParticipantError);

    });

    // =========================
    // happy path (now creates a request)
    // =========================

    it("should create a join request successfully", async () => {

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => ConversationType.GROUP
        });

        conversationBansRepo.isBanned.mockResolvedValue(false);

        participantRepo.exists.mockResolvedValue(false);

        requestMapper.mapToRequestDto.mockReturnValue({
            userId: USER_ID,
            status: "pending"
        });

        const result = await useCase.joinConversationUseCase(
            USER_ID,
            CONVERSATION_ID
        );

        expect(conversationRequestsRepo.create).toHaveBeenCalled();

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv_requests:group:${CONVERSATION_ID}:*`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv_requests:user:${USER_ID}:*`);

        expect(result).toEqual({ userId: USER_ID, status: "pending" });

    });

});