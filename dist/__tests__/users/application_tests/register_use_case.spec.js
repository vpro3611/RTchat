"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const register_use_case_1 = require("../../../src/modules/users/application/register_use_case");
const username_errors_1 = require("../../../src/modules/users/errors/username_errors");
const email_errors_1 = require("../../../src/modules/users/errors/email_errors");
const user_1 = require("../../../src/modules/users/domain/user");
describe("RegisterUseCase", () => {
    let reader;
    let writer;
    let bcrypter;
    let mapper;
    let sendVerifEmailShared;
    let useCase;
    const validUsername = "testuser";
    const validEmail = "test@example.com";
    const validPassword = "Str0ng_P@ss1!";
    beforeEach(() => {
        reader = {
            getUserByUsername: jest.fn(),
            getUserByEmail: jest.fn(),
        };
        writer = {
            save: jest.fn(),
        };
        bcrypter = {
            hash: jest.fn(),
        };
        mapper = {
            mapToDto: jest.fn(),
        };
        sendVerifEmailShared = {
            sendIt: jest.fn(),
        };
        useCase = new register_use_case_1.RegisterUseCase(reader, writer, bcrypter, mapper, sendVerifEmailShared);
    });
    it("should register successfully", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);
        bcrypter.hash.mockResolvedValue("hashedPassword");
        writer.save.mockImplementation(async (user) => user);
        sendVerifEmailShared.sendIt.mockResolvedValue(undefined);
        mapper.mapToDto.mockReturnValue({ id: "user-id" });
        const result = await useCase.registerUseCase(validUsername, validEmail, validPassword);
        expect(reader.getUserByUsername).toHaveBeenCalledWith(validUsername);
        expect(reader.getUserByEmail).toHaveBeenCalledWith(validEmail);
        expect(bcrypter.hash).toHaveBeenCalledWith(validPassword);
        expect(writer.save).toHaveBeenCalled();
        expect(sendVerifEmailShared.sendIt).toHaveBeenCalledWith(validEmail, expect.any(user_1.User), "/public/verify-email", "register");
        expect(mapper.mapToDto).toHaveBeenCalled();
        expect(result).toEqual({ id: "user-id" });
    });
    it("should throw if username already exists", async () => {
        reader.getUserByUsername.mockResolvedValue({});
        await expect(useCase.registerUseCase(validUsername, validEmail, validPassword)).rejects.toBeInstanceOf(username_errors_1.UsernameAlreadyExistsError);
        expect(writer.save).not.toHaveBeenCalled();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });
    it("should throw if email already exists", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue({});
        await expect(useCase.registerUseCase(validUsername, validEmail, validPassword)).rejects.toBeInstanceOf(email_errors_1.EmailAlreadyExistsError);
        expect(writer.save).not.toHaveBeenCalled();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });
    it("should throw if username is invalid", async () => {
        await expect(useCase.registerUseCase("ab", validEmail, validPassword)).rejects.toThrow();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });
    it("should throw if email is invalid", async () => {
        await expect(useCase.registerUseCase(validUsername, "invalid-email", validPassword)).rejects.toThrow();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });
    it("should throw if password is invalid", async () => {
        await expect(useCase.registerUseCase(validUsername, validEmail, "short")).rejects.toThrow();
        expect(bcrypter.hash).not.toHaveBeenCalled();
    });
    it("should propagate bcrypt error", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);
        bcrypter.hash.mockRejectedValue(new Error("bcrypt error"));
        await expect(useCase.registerUseCase(validUsername, validEmail, validPassword)).rejects.toThrow("bcrypt error");
        expect(writer.save).not.toHaveBeenCalled();
    });
    it("should propagate email verification error", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        reader.getUserByEmail.mockResolvedValue(null);
        bcrypter.hash.mockResolvedValue("hashedPassword");
        writer.save.mockImplementation(async (user) => user);
        sendVerifEmailShared.sendIt.mockRejectedValue(new Error("verification error"));
        await expect(useCase.registerUseCase(validUsername, validEmail, validPassword)).rejects.toThrow("verification error");
        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });
});
