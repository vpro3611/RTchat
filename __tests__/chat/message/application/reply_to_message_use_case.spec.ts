import { ReplyToMessageUseCase } from "../../../../src/modules/chat/application/message/reply_to_message_use_case";
import { UserIsNotAllowedToPerformError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { MessageNotAPartOfConversationError, MessageNotFoundError } from "../../../../src/modules/chat/errors/message_errors/message_errors";

describe("ReplyToMessageUseCase", () => {

    let messageRepo: any;
    let messageReplyRepo: any;
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
    let audioProcessor: any;
    let blobRepo: any;

    let useCase: ReplyToMessageUseCase;

    const USER_ID = "user-1";
    const USER_B = "user-2";
    const CONVERSATION_ID = "conv-1";
    const PARENT_MESSAGE_ID = "parent-1";

    beforeEach(() => {

        messageRepo = {
            create: jest.fn(),
            findById: jest.fn()
        };

        messageReplyRepo = {
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

        audioProcessor = {
            processAudio: jest.fn().mockImplementation(b => Promise.resolve({ data: b, duration: 10, mimeType: 'audio/mpeg' }))
        };

        blobRepo = {
            save: jest.fn().mockResolvedValue("blob-1")
        };

        useCase = new ReplyToMessageUseCase(
            messageRepo,
            messageReplyRepo,
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
            audioProcessor, // This might fail initially because constructor doesn't accept it yet
            blobRepo
        );

    });

    it("should reply to message successfully with voice attachment", async () => {

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

        const parentMessage = {
            id: PARENT_MESSAGE_ID,
            getConversationId: () => CONVERSATION_ID,
            getSenderId: () => USER_B,
            getContent: () => ({ getContentValue: () => "parent content" })
        };
        messageRepo.findById.mockResolvedValue(parentMessage);

        conversationRepo.getMaxReadAtForOthers.mockResolvedValue(new Date());

        mapper.mapToMessage.mockReturnValue({ id: "msg-reply-1" });

        const files = [
            { buffer: Buffer.from("audio"), originalname: "voice.mp3", mimetype: "audio/mpeg", size: 5 }
        ];

        const result = await useCase.replyToMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            PARENT_MESSAGE_ID,
            "reply with voice",
            files
        );

        expect(virusScanner.scanBuffer).toHaveBeenCalledTimes(1);
        expect(audioProcessor.processAudio).toHaveBeenCalledTimes(1);
        expect(blobRepo.save).toHaveBeenCalledTimes(1);

        expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            attachments: expect.arrayContaining([
                expect.objectContaining({
                    name: "voice.mp3",
                    type: "voice",
                    duration: 10
                })
            ])
        }));

        expect(messageReplyRepo.create).toHaveBeenCalled();

        expect(result).toEqual({ id: "msg-reply-1" });

    });

});
