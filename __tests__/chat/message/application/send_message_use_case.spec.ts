import { SendMessageUseCase } from "../../../../src/modules/chat/application/message/send_message_use_case";
import { UserIsNotAllowedToPerformError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("SendMessageUseCase", () => {

    let messageRepo: any;
    let conversationRepo: any;
    let mapper: any;
    let checkIsParticipant: any;
    let cacheService: any;
    let participantRepo: any;
    let userToUserBansRepo: any;
    let conversationBansRepo: any;
    let virusScanner: any;
    let videoProcessor: any;
    let imageProcessor: any;
    let blobRepo: any;

    let useCase: SendMessageUseCase;

    const USER_ID = "user-1";
    const USER_B = "user-2";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {

        messageRepo = {
            create: jest.fn()
        };

        conversationRepo = {
            findById: jest.fn(),
            updateLastMessage: jest.fn(),
            getMaxReadAtForOthers: jest.fn()
        };

        mapper = {
            mapToMessage: jest.fn()
        };

        checkIsParticipant = {
            checkIsParticipant: jest.fn()
        };

        cacheService = {
            delByPattern: jest.fn(),
            del: jest.fn()
        };

        participantRepo = {
            getParticipants: jest.fn()
        };

        userToUserBansRepo = {
            ensureAnyBlocksExists: jest.fn()
        };

        conversationBansRepo = {
            isBanned: jest.fn()
        };

        virusScanner = {
            scanBuffer: jest.fn().mockResolvedValue(true)
        };

        videoProcessor = {
            stripMetadata: jest.fn().mockImplementation(b => Promise.resolve(b))
        };

        imageProcessor = {
            processImage: jest.fn().mockImplementation(b => Promise.resolve({ data: b, mimeType: 'image/webp' }))
        };

        blobRepo = {
            save: jest.fn().mockResolvedValue("blob-1")
        };

        useCase = new SendMessageUseCase(
            messageRepo,
            conversationRepo,
            mapper,
            checkIsParticipant,
            cacheService,
            participantRepo,
            userToUserBansRepo,
            conversationBansRepo,
            virusScanner,
            videoProcessor,
            imageProcessor,
            blobRepo
        );

    });

    // =========================
    // cannot send messages
    // =========================

    it("should throw if participant cannot send messages", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getCanSendMessages: () => false
        });

        await expect(
            useCase.sendMessageUseCase(
                USER_ID,
                CONVERSATION_ID,
                "hello"
            )
        ).rejects.toBeInstanceOf(UserIsNotAllowedToPerformError);

    });

    // =========================
    // happy path
    // =========================

    it("should send message successfully", async () => {

        const participant = {
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "direct"
        });

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });

        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(false);

        conversationRepo.getMaxReadAtForOthers.mockResolvedValue(new Date());

        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const result = await useCase.sendMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            "hello world"
        );

        expect(messageRepo.create).toHaveBeenCalled();

        expect(conversationRepo.updateLastMessage)
            .toHaveBeenCalledWith(
                CONVERSATION_ID,
                expect.any(Date)
            );

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`messages:${CONVERSATION_ID}:*`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_ID}:*`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_B}:*`);

        expect(result).toEqual({ id: "msg-1" });

    });

    it("should send message with attachments successfully", async () => {

        const participant = {
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "group"
        });

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID }
            ]
        });

        conversationRepo.getMaxReadAtForOthers.mockResolvedValue(new Date());

        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const files = [
            { buffer: Buffer.from("test"), originalname: "test.png", mimetype: "image/png", size: 4 },
            { buffer: Buffer.from("test2"), originalname: "test.mp4", mimetype: "video/mp4", size: 5 }
        ];

        const result = await useCase.sendMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            "hello with files",
            files
        );

        expect(virusScanner.scanBuffer).toHaveBeenCalledTimes(2);
        expect(imageProcessor.processImage).toHaveBeenCalledTimes(1);
        expect(videoProcessor.stripMetadata).toHaveBeenCalledTimes(1);
        expect(blobRepo.save).toHaveBeenCalledTimes(2);
        
        expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            attachments: expect.arrayContaining([
                expect.objectContaining({ name: "test.png", type: "image" }),
                expect.objectContaining({ name: "test.mp4", type: "video" })
            ])
        }));

        expect(result).toEqual({ id: "msg-1" });

    });

    // =========================
    // blocking relations in direct conversation
    // =========================

    it("should throw if actor is blocked by target in direct conversation", async () => {

        const participant = {
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "direct"
        });

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });

        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(true);

        await expect(
            useCase.sendMessageUseCase(
                USER_ID,
                CONVERSATION_ID,
                "hello"
            )
        ).rejects.toBeInstanceOf(UserIsNotAllowedToPerformError);

        expect(userToUserBansRepo.ensureAnyBlocksExists)
            .toHaveBeenCalledWith(USER_ID, USER_B);

    });

    it("should allow sending if no blocking relations in direct conversation", async () => {

        const participant = {
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "direct"
        });

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });

        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(false);

        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const result = await useCase.sendMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            "hello"
        );

        expect(result).toEqual({ id: "msg-1" });

    });

    it("should skip blocking check for group conversations", async () => {

        const participant = {
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "group"
        });

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });

        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const result = await useCase.sendMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            "hello"
        );

        expect(userToUserBansRepo.ensureAnyBlocksExists).not.toHaveBeenCalled();

        expect(result).toEqual({ id: "msg-1" });

    });

});